import { useQuery } from "@tanstack/react-query";
import { organizationService } from "@/services/organizationService";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const useTags = (familyId: string, enabled = true) => {
    return useQuery({
        queryKey: [QUERY_KEYS.TAGS, familyId],
        queryFn: () => organizationService.getTags(familyId),
        enabled: !!familyId && enabled,
    });
};

export const useLocations = (familyId: string, enabled = true) => {
    return useQuery({
        queryKey: [QUERY_KEYS.LOCATIONS, familyId],
        queryFn: () =>
            organizationService.getLocations(familyId).catch(() => []),
        enabled: !!familyId && enabled,
    });
};

export const useProjects = (familyId: string, enabled = true) => {
    return useQuery({
        queryKey: [QUERY_KEYS.PROJECTS, familyId],
        queryFn: () => organizationService.getProjects(familyId),
        enabled: !!familyId && enabled,
    });
};
