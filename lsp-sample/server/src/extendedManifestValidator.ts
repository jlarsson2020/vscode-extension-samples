export class ExtendedManifestValidator {
	static platformTypes : {
		[platform: string] : boolean
	} = {
		"default": true,
		"win32": true,
		"mac": true,
		"web": true
	}
	static validateExtendedManifest(extendedManifest: {
		resources? : any,
		shortcuts? : any,
		actions? : any
	}) : {
		errorContent: any,
		errorMessage: string
	}[] {
		var errors: {errorContent: any, errorMessage: string}[] = [];
		var needsResources = false;
		var resources = extendedManifest.resources;
		var shortcuts = extendedManifest.shortcuts;
		var actions = extendedManifest.actions;
		if (shortcuts == null && actions == null) {
			errors.push({
				errorContent: extendedManifest,
				errorMessage: "\"shortcuts\" or \"actions\" do not exist in this extended manifest."
			});
		}
		if (shortcuts) {
			for (var i = 0; i < shortcuts.length; i++) {
				if (shortcuts[i]["action"] == null) {
					errors.push({
						errorContent: shortcuts[i],
						errorMessage: "\"action\" does not exist in \"shortcuts\"."
					});
				}
				if (shortcuts[i]["key"] == null) {
					errors.push({
						errorContent: shortcuts[i],
						errorMessage: "\"key\" does not exist in \"shortcuts\"."
					});
				}
				else if (typeof(shortcuts[i]["key"])!== "object") {
					errors.push({
						errorContent: {key: shortcuts[i]["key"]},
						errorMessage: "\"key\" does not contain an object."
					});
				}
				else {
					var platforms = Object.keys(shortcuts[i]["key"]);
					for (var j = 0; j < platforms.length; j++) {
						if (ExtendedManifestValidator.platformTypes[platforms[j]] == null) {
							errors.push({
								errorContent: platforms[j],
								errorMessage: "Invalid platform."
							});
						}
						else {
							if (!ExtendedManifestValidator.validateTokenValue(shortcuts[i]["key"][platforms[j]])) {
								if (typeof(shortcuts[i]["key"][platforms[j]]) !== "string") {
									errors.push({
										errorContent: shortcuts[i]["key"][platforms[j]],
										errorMessage: "Invalid key value."
									});
								}
							}
							needsResources = true;
						}
					}
				}
			}
		}
		if (actions) {
			for (var i = 0; i < actions.length; i++) {
				if (actions[i]["id"] == null || actions[i]["type"] == null|| actions[i]["name"] == null) {
					errors.push({
						errorContent: actions[i],
						errorMessage: "\"id\" or \"type\" or \"name\" is missing from \"actions\"."
					});
				}
				else {
					if (!ExtendedManifestValidator.validateTokenValue(actions[i]["name"])) {
						if (typeof(actions[i]["name"]) !== "string") {
							errors.push({
								errorContent: {"name": actions[i]["name"]},
								errorMessage: "Invalid name for actions."
							});
						}
					}
					needsResources = true;
				}
			}
		}
		if (needsResources) {
			if (resources == null) {
				errors.push({
					errorContent: extendedManifest,
					errorMessage: "\"resources\" is missing from extended manifest."
				});
			}
			if (resources["default"] == null) {
				errors.push({
					errorContent: resources,
					errorMessage: "\"default\" is missing from \"resources\"."
				});
			}
			for (var i = 0; i < resources["default"].length; i++) {
				if (resources["default"][i]["value"] == null || resources["default"][i]["comment"] == null) {
					errors.push({
						errorContent: resources["default"][i],
						errorMessage: "\"value\" or \"comment\" is missing from \"resources\"."
					});
				}
			}
		}
		return errors;
		
	}

	static convertErrorLineToRegex(content: any) {
		if (typeof(content) === "object") {
			var contentString = JSON.stringify(content);
			contentString = contentString.replace(/[\S]\s[\S]/g, "");
			contentString = contentString.replace(/{(?!resource\.)/g, "[\\s]*{[\\s]*");
			contentString = contentString.replace(/}(?![\s"])/g, "[\\s]*}[\\s]*");
			contentString = contentString.replace(/:/g, "[\\s]*:[\\s]*");
			contentString = contentString.replace(/,/g, "[\\s]*,[\\s]*");
			contentString = contentString.replace(/\"/g, "\\\"");
			contentString = contentString.replace(/\$/g, "\\$");
			contentString = contentString.substring(5, contentString.length-5);
			contentString = contentString.replace(/^{\[\\s\]\*/g, "");
			contentString = contentString.replace(/\[\\s\]\*}$/g, "");
			return contentString;
		}
		return content;

	}

	static validateTokenValue(tokenValue: string) {
		var tokenValidationRegex = new RegExp('^\\$\\{resource\\.([A-Za-z0-9_-]+)\\}$');
		return tokenValidationRegex.test(tokenValue);

	}

	static validateExtendedManifestResources() {
		return true;
	}
}
