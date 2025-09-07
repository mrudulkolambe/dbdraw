import API_URLS from "../index";
import { IEdge } from "@/types/schemas/edge";
import { BaseApiService } from "@/services/base";

class EdgeService extends BaseApiService {
    constructor(getTokenFn?: () => Promise<string | null>) {
        super(getTokenFn);
    }
    
    createEdge = async (data: IEdge) => {
        return await this.post(API_URLS.CREATE_EDGE, data);
    }
    
    deleteEdge = async (edgeID: string) => {
        return await this.delete(API_URLS.DELETE_EDGE(edgeID));
    }

	deleteEdges = async (edgeIDs: string[]) => {
		return await this.delete(API_URLS.DELETE_EDGES, { ids: edgeIDs });
	}
}

export default EdgeService;
