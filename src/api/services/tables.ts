import API_URLS from "../index";
import { ITable } from "@/types/schemas/table";
import { BaseApiService } from "@/services/base";

class TableService extends BaseApiService {
	constructor(getTokenFn?: () => Promise<string | null>) {
		super(getTokenFn);
	}
	createTable = async (data: ITable) => {
		return await this.post(API_URLS.CREATE_TABLE, data);
	}
	
	updateTable = async (tableID: string, data: ITable) => {
		return await this.put(API_URLS.UPDATE_TABLE(tableID), data);
	}

	deleteTable = async (tableID: string) => {
		return await this.delete(API_URLS.DELETE_TABLE(tableID));
	}
}

export default TableService;