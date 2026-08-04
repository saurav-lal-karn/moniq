import { apiFetch } from "@/lib/api";

export interface Tag {
    id: string;
    name: string;
    color?: string;
}

export interface Location {
    id: string;
    name: string;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
}

export const organizationService = {
    async getTags(familyId: string): Promise<Tag[]> {
        return apiFetch<Tag[]>(`/organization/tags?family_id=${familyId}`).catch(() => []);
    },

    async getLocations(familyId: string): Promise<Location[]> {
        return apiFetch<Location[]>(`/organization/locations?family_id=${familyId}`).catch(() => []);
    },

    async getProjects(familyId: string): Promise<Project[]> {
        return apiFetch<Project[]>(`/organization/projects?family_id=${familyId}`).catch(() => []);
    },
};
