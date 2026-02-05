import projectService from "../services/project.service.js";

export const createProject = async (req, res) => {
    try {
        const project = await projectService.createProject({
            ...req.body,
            user_id: req.user.id
        });
        res.status(201).json({ message: "Project created successfully", project });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getWorkspaceProjects = async (req, res) => {
    try {
        const projects = await projectService.getWorkspaceProjects(
            req.params.workspaceId,
            req.user.id
        );
        res.status(200).json({ projects });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getProject = async (req, res) => {
    try {
        const project = await projectService.getProjectById(req.params.id, req.user.id);
        res.status(200).json({ project });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const addProjectMember = async (req, res) => {
    try {
        const membership = await projectService.addProjectMember({
            project_id: req.params.id,
            ...req.body,
            admin_id: req.user.id
        });
        res.status(201).json({ message: "Member added successfully", membership });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export default {
    createProject,
    getWorkspaceProjects,
    getProject,
    addProjectMember
};