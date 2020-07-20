const { static } = require("express");
const expressSanitizer = require("express-sanitizer");
var expresssanitizer = require("express-sanitizer"),
    methodoverride = require("method-override"),
    bodyparser = require("body-parser"),
    mongoose = require("mongoose"),
    express = require("express"),
    app = express();
mongoose.connect("mongodb://localhost/restfullblogapp", { useUnifiedTopology: true, useNewUrlParser: true });

//can copy these lines all the time
app.set("view engine", "ejs");
// css wont load if this is not written
app.use(express.static('public'));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(expresssanitizer());
app.use(methodoverride("_method"));

var blogschema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: { type: Date, default: Date.now }
});
var blog = mongoose.model("blog", blogschema);

//restful routes
app.get("/", function (req, res) {
    res.redirect("/blogs");
});

//index route
app.get("/blogs", function (req, res) {
    blog.find({}, function (err, blogs) {
        if (err) {
            console.log(err);
        } else {
            res.render("index", { blogs: blogs });
        }
    });
});

//new route
app.get("/blogs/new", function (req, res) {
    res.render("new");
});

//create route
app.post("/blogs", function (req, res) {
    // this line removes script tag present in blog body entered by user
    req.body.blog.body = req.sanitize(req.body.blog.body);
    blog.create(req.body.blog, function (err, newblog) {
        if (err) {
            res.render("new");
        } else {
            res.redirect("/blogs");
        }
    })
});

//show route
app.get("/blogs/:id", function (req, res) {
    blog.findById(req.params.id, function (err, foundblog) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.render("show", { blog: foundblog });
        }
    });
});

//edit route
app.get("/blogs/:id/edit", function (req, res) {
    blog.findById(req.params.id, function (err, foundblog) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.render("edit", { blog: foundblog });
        }
    });
});

//update route
app.put("/blogs/:id", function (req, res) {
    // this line removes script tag present in blog body entered by user
    req.body.blog.body = req.sanitize(req.body.blog.body);
    blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, updatedblog) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

app.delete("/blogs/:id", function (req, res) {
    blog.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});

app.listen(5000, function (req, res) {
    console.log("Server is up");
});