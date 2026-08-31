import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";  
import { ProjectTable } from "../models/project.models.js"
import { noteTable } from "../models/note.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { deleteFromS3 } from "../utils/s3-delete.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3_Client from "../config/s3.js";

const attachSignedUrls = async (notes) => {
    return Promise.all(
        notes.map(async (note) => {
            const noteObj = note.toObject ? note.toObject() : { ...note };
            if (noteObj.attachments && noteObj.attachments.length > 0) {
                noteObj.attachments = await Promise.all(
                    noteObj.attachments.map(async (att) => {
                        if (att.key) {
                            try {
                                const command = new GetObjectCommand({
                                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                                    Key: att.key
                                });
                                const signedUrl = await getSignedUrl(s3_Client, command, { expiresIn: 3600 * 24 }); // 24 hours valid
                                return { ...att, url: signedUrl };
                            } catch (e) {
                                return att;
                            }
                        }
                        return att;
                    })
                );
            }
            return noteObj;
        })
    );
};

export const createNote = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    if (!projectId) {
        throw new ApiError(400, "Project ID is required");
    }

    const { title, content, tags, isPinned } = req.body;
    if (!title || !content) {
        throw new ApiError(400, "Title and content are required");
    }

    const project  = await ProjectTable.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // handle attachments for s3 bucket
    const attachments = req.files?.map((file) => ({
        url: file.location,
        key: file.key,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploadedBy: req.user._id
    }))

    const note = await noteTable.create({
        title: title,
        content: content,
        projectId: projectId,
        createdBy: req.user._id,
        lastEditedBy: req.user._id,
        tags: tags || [],
        isPinned: isPinned || false,
        attachments: attachments || []
    })

    const [noteWithUrl] = await attachSignedUrls([note]);
    return res.status(201).json(new ApiResponse(201, noteWithUrl, "Note created successfully"))

})


// -------------------LIst notes------------------
export const listNotes = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    if (!projectId) {
        throw new ApiError(400, "Project ID is required");
    }

    const {search, tags, pinned, sort } = req.query;

    const filter = { projectId };
    if (search) filter.$text = { $search: search };

    if (tags) filter.tags = { $in: tags.split(",") };

    if (pinned) filter.isPinned = pinned === "true";

    const notes = await noteTable.find(filter).populate("createdBy", "username email").sort({ createdAt: -1 });
    const notesWithUrls = await attachSignedUrls(notes);
    return res.status(200).json(new ApiResponse(200, notesWithUrls, "Notes fetched successfully"));
})

//--------------------update note------------------


export const updateNote = asyncHandler(async (req, res) => {
    const {projectId, noteId} = req.params
    if(!projectId || !noteId) {
        throw new ApiError(400, "Project ID and Note ID are required");
    }

    const {title, content, tags, isPinned = false } = req.body
    if(!title && !content && !tags){
        throw new ApiError(400, "At least one field (title, content, tags) is required to update")
    }

    const project  = await ProjectTable.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const note = await noteTable.findById(noteId)
    if(!note){
        throw new ApiError(400, "Note not found"); 
    }


    const membership = await ProjectMember.findOne({ project: projectId, user: req.user._id });
    if (!membership) {
        throw new ApiError(403, "Access denied. You are not a member of this project");
    }

    if (membership.role !== "admin" && note.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only edit notes created by you");
    }

// just before update , push old version in history array
if(title || content || tags){
    note.versionHistory.push({
        title: note.title,
        content: note.content,
        editedBy: req.user._id,
        editedAt: new Date()
    })

}

note.version += 1

// updating 
if (title) note.title = title
if (content) note.content = content
if(tags) note.tags= tags
if(isPinned !== undefined) note.isPinned = isPinned

note.lastEditedBy = req.user._id

await note.save()

return res.status(200).json(new ApiResponse(200, note, "Notes updated successfully"))
  

})



//----------------------------delete note------------------
export const deleteNote = asyncHandler(async (req, res) => {
    const { projectId, noteId} = req.params
    if(!projectId || !noteId){
        throw new ApiError(400, "Project ID and Note ID are required");
    }

    const project  = await ProjectTable.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const note = await noteTable.findById(noteId)
    if(!note){
        throw new ApiError(400, "Note not found"); 
    }

    if (note.projectId.toString() !== projectId) {
       throw new ApiError(403, "Note does not belong to this project");
   }

    const membership = await ProjectMember.findOne({ project: projectId, user: req.user._id });
    if (!membership) {
        throw new ApiError(403, "Access denied. You are not a member of this project");
    }

    if (membership.role !== "admin" && note.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete notes created by you");
    }

    if(note.attachments.length > 0) {
            await Promise.all(
                note.attachments.map(file => 
                deleteFromS3(file.url))
            )
        }

    await noteTable.findByIdAndDelete(noteId)

    return res.status(200).json(new ApiResponse(200, null , "Note deleted successfully"))

})


