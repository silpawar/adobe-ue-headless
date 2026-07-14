/*
Copyright 2020 Adobe
All Rights Reserved.
NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
import { useState, useEffect } from 'react';
import { getAuthorHost } from "../utils/fetchData";


/**
 * Custom React Hook to perform a GraphQL query
 * @param path - Persistent query path
 */
function useGraphQL(path) {
	let [data, setData] = useState(null);
	let [errorMessage, setErrors] = useState(null);
	useEffect(() => {
		let isMounted = true;

		async function makeRequest() {
			try {
				const response = await fetch(`${getAuthorHost()}/graphql/execute.json/${path}`, {
					credentials: "include"
				});
				const contentType = response.headers.get("content-type") || "";
				const responseText = await response.text();

				if (!contentType.includes("application/json")) {
					setErrors(`Expected JSON from GraphQL endpoint but received ${contentType || "unknown content type"}. Check AEM login/CORS/redirect for ${path}.`);
					return;
				}

				const result = JSON.parse(responseText);

				if (!isMounted) {
					return;
				}

				if (!response.ok || result.errors) {
					setErrors(mapErrors(result.errors || [{ message: `Request failed with status ${response.status}` }]));
					return;
				}

				if (result.data) {
					setData(result.data);
				}
			} catch (error) {
				if (!isMounted) {
					return;
				}
				setErrors(error?.message || String(error));
				sessionStorage.removeItem('accessToken');
			}
		}

		setData(null);
		setErrors(null);
		makeRequest();

		return () => {
			isMounted = false;
		};
	}, [path]);


	return { data, errorMessage }
}

/**
 * concatenate error messages into a single string.
 * @param {*} errors
 */
function mapErrors(errors) {
	return errors.map((error) => error.message || String(error)).join(",");
}

export default useGraphQL;
