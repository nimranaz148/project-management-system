import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";  
import { ProjectTable } from "../models/project.models.js"
import { noteTable } from "../models/note.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { deleteFromS3 } from "../utils/s3-delete.js";





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
    return res.status(201).json(new ApiResponse(201, note, "Note created successfully"))

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

    const notes = await noteTable.find(filter);
    return res.status(200).json(new ApiResponse(200, notes, "Notes fetched successfully"));
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

    if(note.attachments.length > 0) {
            await Promise.all(
                note.attachments.map(file => deleteFromS3(file.key))
            )
        }

    await noteTable.findByIdAndDelete(noteId)

    return res.status(200).json(new ApiResponse(200, null , "Note deleted successfully"))

})
