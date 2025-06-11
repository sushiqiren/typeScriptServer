type APIConfig = {
    fileserverHits: number;
}

// create a config object that will hold the stateful data and this object can be imported in other files

const config: APIConfig = {
    fileserverHits: 0,
};

export { config };