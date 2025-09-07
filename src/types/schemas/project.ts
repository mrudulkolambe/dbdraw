export interface IProject {
	_id: string;
	title: string;
	description: string;
	tags: string[];
	projectID: string;
	userID: string;
	createdAt: Date;
	updatedAt: Date;
}
