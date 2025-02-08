const Movie = require("../models/movie");

// GET /api/movies - Retrieve all movies, with optional filtering by title
exports.getAllMovies = async (req, res) => {
  try {
    const filter = req.query.title ? { where: { title: req.query.title } } : {};
    const movies = await Movie.findAll(filter);
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch movies" });
  }
};

// GET /api/movies/:id - Retrieve a single movie by ID
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

// POST /api/movies - Create a new movie
exports.createMovie = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }
    const movie = await Movie.create({ title, description });
    res.status(201).json(movie);
  } catch (err) {
    res.status(500).json({ error: "Failed to create movie" });
  }
};

// PUT /api/movies/:id - Update a movie by ID
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

// DELETE /api/movies/:id - Delete a single movie by ID
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

// DELETE /api/movies - Delete all movies
exports.deleteAllMovies = async (req, res) => {
  try {
    await Movie.destroy({ where: {} });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete movies" });
  }
};
