import { getSearchParamsForHashRouting } from "./commons";

const DEFAULT_AUTHOR_HOST = "https://author-p9606-e71941.adobeaemcloud.com/";

const getAuthorHostFromEnv = () => {
    return (
        import.meta.env.VITE_AUTHOR_HOST ||
        import.meta.env.VITE_REACT_APP_DEFAULT_HOST ||
        import.meta.env.VITE_REACT_APP_AUTHOR_HOST ||
        DEFAULT_AUTHOR_HOST
    );
};

export const fetchData = async (path) => {
    const url = `${getAuthorHost()}/${path.split(":/")[1]}.infinity.json`;
    const data = await fetch(url, { headers: { "X-Aem-Affinity-Type": "api" }, credentials: "include" });
    const json = await data.json();
    return json;
};
export const getAuthorHost = () => {
    const searchParams = getSearchParamsForHashRouting();
    if (searchParams.has("authorHost")) {
        return searchParams.get("authorHost");
    } else {
        return getAuthorHostFromEnv();
    }
}

export const getImageURL = (obj) => {
    if (obj === null || obj === undefined) {
        return undefined;
    }

    if (typeof obj === "string") {
        if (obj.startsWith("https://")) {
            return obj;
        }
        return `${getAuthorHost()}${obj}`;
    }

    if (obj._authorUrl !== undefined) {
        return obj._authorUrl;
    }

    if (obj.repositoryId !== undefined && obj.assetId !== undefined) {
        return `https://${obj.repositoryId}/adobe/assets/${obj.assetId}`;
    }

    if (obj._path !== undefined) {
        return `${getAuthorHost()}${obj._path}`;
    }

    return undefined;
}

export const getProtocol = () => {
    const searchParams = getSearchParamsForHashRouting();
    if (searchParams.has("protocol")) {
        return searchParams.get("protocol");
    } else {
        return "aem";
    }
}

export const getService = () => {
    const searchParams = getSearchParamsForHashRouting();
    if (searchParams.has("service")) {
        return searchParams.get("service");
    }
    return null;
}

