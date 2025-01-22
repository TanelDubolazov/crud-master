const Movie = require("../models/movie");

// Retrieve all movies
exports.getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.findAll();
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch movies" });
    }
};

// Retrieve a movie by ID
exports.getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findByPk(req.params.id);
        if (movie) {
            res.json(movie);
        } else {
            res.status(404).json({ error: "Movie not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch movie" });
    }
};

// Add a new movie
exports.createMovie = async (req, res) => {
    try {
        const movie = await Movie.create(req.body);
        res.status(201).json(movie);
    } catch (err) {
        res.status(500).json({ error: "Failed to create movie" });
    }
};

// Update a movie
exports.updateMovie = async (req, res) => {
    try {
        const movie = await Movie.findByPk(req.params.id);
        if (movie) {
            await movie.update(req.body);
            res.json(movie);
        } else {
            res.status(404).json({ error: "Movie not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to update movie" });
    }
};

// Delete a movie
exports.deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findByPk(req.params.id);
        if (movie) {
            await movie.destroy();
            res.status(204).send();
        } else {
            res.status(404).json({ error: "Movie not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to delete movie" });
    }
};
