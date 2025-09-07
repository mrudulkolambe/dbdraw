class API_URLS {
	static BASE_URL = "http://localhost:4000/api/v1";

	static PROJECTS = `${API_URLS.BASE_URL}/projects`;
	static TEMPLATES = `${API_URLS.BASE_URL}/templates`;



	static CREATE_PROJECT = `${API_URLS.BASE_URL}/projects/create`;
	static GET_USER_PROJECT = `${API_URLS.BASE_URL}/projects/user`;

	static GET_PROJECT_BY_ID = (projectID: string) => `${API_URLS.BASE_URL}/projects/${projectID}`;
	static CREATE_TABLE = `${API_URLS.BASE_URL}/tables/create`;
	static CREATE_EDGE = `${API_URLS.BASE_URL}/edges/create`;
	static UPDATE_TABLE = (tableID: string) => `${API_URLS.BASE_URL}/tables/${tableID}`;
	static DELETE_TABLE = (tableID: string) => `${API_URLS.BASE_URL}/tables/${tableID}`;
	static DELETE_EDGE = (edgeID: string) => `${API_URLS.BASE_URL}/edges/${edgeID}`;
	static DELETE_EDGES = `${API_URLS.BASE_URL}/edges/multiple`;
	static SAVE_PROJECT = (projectID: string) => `${API_URLS.BASE_URL}/projects/save/${projectID}`;	

}

export default API_URLS;