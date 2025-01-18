'client-only';

import Diagrams from '../model/draw.model';
import { currentUser } from "@clerk/nextjs/server";
import { connect } from '../db';

class DiagramActions {
	constructor() { };

	async createDiagram(name: string, tag: string) {
		await connect();
		const user = await currentUser()
		if (user) {
			const drawInit = new Diagrams({
				user: user?.id,
			})
			const savedDraw = await drawInit.save();

			return savedDraw._id;
		}else{
			return null;
		}
	}
}


export default DiagramActions;