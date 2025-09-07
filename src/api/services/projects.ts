import { IProject } from "@/types/schemas/project";
import API_URLS from "../index";
import { BaseApiService, ApiResponse } from "@/services/base";
import { ITable } from "@/types/schemas/table";
import { IEdge } from "@/types/schemas/edge";
import { Edge } from "@xyflow/react";

interface ICompleteProject extends IProject {
	tables: ITable[];
	edges: IEdge[];
}

class ProjectService extends BaseApiService {
	constructor(getTokenFn?: () => Promise<string | null>) {
		super(getTokenFn);
	}

	getUserProjects = async () => {
		const response = await this.get(API_URLS.GET_USER_PROJECT);
		if (response.status === 200) {
			return response as ApiResponse<IProject[]>;
		} else {
			return response as ApiResponse<null>;
		}
	}

	createProject = async (data: { title: string; description: string }) => {
		return await this.post(API_URLS.CREATE_PROJECT, data);
	}

	getProjectById = async (projectID: string) => {
		const response = await this.get(API_URLS.GET_PROJECT_BY_ID(projectID));
		if (response.status === 200) {
			return response as ApiResponse<ICompleteProject>;
		} else {
			return response as ApiResponse<null>;
		}
	}

	saveProject = async (projectID: string, data: { title: string; description: string, tables: ITable[], edges: IEdge[] }) => {
		return await this.put(API_URLS.SAVE_PROJECT(projectID), data);
	}
}

export default ProjectService;