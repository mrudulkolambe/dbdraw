const fs = require("fs");

// Function to convert JSON to collections format
function convertJsonToCollectionsFormat(filePath) {
	try {
		// Read and parse the JSON file
		const rawData = fs.readFileSync(filePath, "utf-8");
		const inputJson = JSON.parse(rawData);

		const edges = inputJson.edges; // Extract edges to handle references
		const collections = inputJson.nodes.map((node,) => {
			const formattedFields = node.data.fields.map((field, fieldIndex) => {
				const formattedField = {
					name: field.name,
					type: field.type,
				};

				if (field.primary) formattedField.primary = true;
				if (field.required) formattedField.required = true;
				if (field.unique) formattedField.unique = true;
				if (field.default !== undefined) formattedField.default = field.default;
				formattedField.isList = field.isList || false;

				// Add reference fields based on edges
				// Loop through the fields and check for references
				if (field.type === "ref") {
					// Find the edge based on the target (i.e., the referenced collection)
					const edge = edges.find((edge) => {
						// Log for debugging to see the edge search condition
						console.log("Test", node.data.label, edge.target, edge.targetHandle, `target-${fieldIndex}`);

						// Ensure we're matching the target id and the correct handle (based on field index)
						return edge.target === node.id && edge.targetHandle === `target-${fieldIndex}`;
					});

					// Log the found edge
					console.log({ edge });

					if (edge) {
						// Find the target node (the collection being referenced)
						const targetNode = inputJson.nodes.find((n) => n.id === edge.source);

						// If the target node is found, set the ref field to the target collection name
						if (targetNode) {
							formattedField.ref = targetNode.data.label;
						}
					}
				} else if (field.isList) {
					formattedField.isList = true;
				}

				return formattedField;
			});

			return {
				collectionName: node.data.label,
				fields: formattedFields,
			};
		});

		// Return the converted collections
		return collections;
	} catch (error) {
		console.error("Error reading or converting JSON:", error.message);
		return null;
	}
}

// Function to generate schemas
function generateSchemas(json) {
	const schemas = json.map((collection) => {
		const { collectionName, fields } = collection;
		const pascalCaseCollectionName = toPascalCase(collectionName);

		// Filter out the _id field and create field definitions
		const fieldDefinitions = fields
			.filter((field) => field.name !== "_id")  // Exclude _id field
			.map((field) => {
				const fieldOptions = [];
				if (field.primary) {
					// Do not include _id field manually
				} else {
					if (field.type === "ref") {
						fieldOptions.push(
							`type: mongoose.Schema.Types.ObjectId`,
							`ref: "${field.ref}"`,
							field.required ? `required: true` : ``
						);
					} else if (field.type !== "primary") {
						fieldOptions.push(`type: ${toPascalCase(field.type)}`);
						if (field.required) fieldOptions.push(`required: true`);
						if (field.unique) fieldOptions.push(`unique: true`);
						if (field.default !== undefined)
							fieldOptions.push(`default: ${JSON.stringify(field.default)}`);
					}
				}
				// Return the field definition only if the field has options
				if (fieldOptions.length > 0) {
					return `\t\t${field.name}: { ${fieldOptions.filter(Boolean).join(", ")} }`;
				}
				return null;
			})
			.filter(Boolean); // Remove null values from the array

		// If no valid field definitions, skip this collection's schema generation
		if (fieldDefinitions.length === 0) return "";

		return `
		const ${pascalCaseCollectionName}Schema = new mongoose.Schema({
		${fieldDefinitions.join(",\n")}
		});
		
		const ${pascalCaseCollectionName} = mongoose.model("${collectionName.toLowerCase()}", ${pascalCaseCollectionName}Schema);
		`;
	}).filter(Boolean); // Remove empty schemas

	return `
		const mongoose = require("mongoose");
		
		${schemas.join("\n")}
		module.exports = { ${json.map((c) => toPascalCase(c.collectionName)).join(", ")} };
	`;
}

// Example usage
const filePath = "./diagram.json"; // Path to the input JSON file
const collections = convertJsonToCollectionsFormat(filePath);

if (collections) {
	console.log("Converted Collections:", JSON.stringify(collections, null, 2));
	const schemasCode = generateSchemas(collections);

	// Write the generated schemas to a file
	fs.writeFileSync("schemas.js", schemasCode, "utf-8");
	console.log("Schemas generated and saved to schemas.js");
}


function toPascalCase(str) {
	return str
		.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => index === 0 ? match.toUpperCase() : match.toLowerCase())
		.replace(/\s+/g, '');
}