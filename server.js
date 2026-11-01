var express = require("express");
var db = require("./db-connections");
var app = express();

app.use(express.json());
app.use(express.static("./public"));

app.route("/testjson").get(function (req, res) {
  res.json({ message: "Welcome to my Animal Adoption server" });
});

app.route("/testtext").get(function (req, res) {
  res.send("Server is running (not JSON)");
});

//search functino
app.get("/animal/search", function (req, res) {
  var name = req.query.name || "";
  var status = req.query.status || "";
  var species = req.query.species || "";

  var sql = `
    SELECT a.*, s.species
    FROM animal_adoption.animal a
    LEFT JOIN animal_adoption.species s ON a.animal_id = s.animal_id
    WHERE a.name LIKE ?
      AND a.status LIKE ?
      AND (s.species LIKE ? OR s.species IS NULL)
  `;

  var params = ["%" + name + "%", "%" + status + "%", "%" + species + "%"];

  db.query(sql, params, function (err, result) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});


//get all animals
app.route("/animal").get(function (req, res) {
  var sql = "SELECT * FROM animal_adoption.animal";

  db.query(sql, function (error, result) {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(result);
  });
});

//get animal by id
app.route("/animal/:id").get(function (req, res) {
  var sql = "SELECT * FROM animal_adoption.animal WHERE animal_id = ?";
  var parameter = [req.params.id];

  db.query(sql, parameter, function (error, result) {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(result);
  });
});

//post add animal
app.route("/animal").post(function (req, res) {
  var sql =
    "INSERT INTO animal_adoption.animal (name, breed, age, gender, status, description) VALUES (?, ?, ?, ?, ?, ?)";
  var parameter = [
    req.body.name,
    req.body.breed,
    req.body.age,
    req.body.gender,
    req.body.status,
    req.body.description,
  ];

  db.query(sql, parameter, function (error, result) {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(result);
  });
});

//put update animal
app.route("/animal/:id").put(function (req, res) {
  var sql =
    "UPDATE animal_adoption.animal SET name = ?, breed = ?, age = ?, gender = ?, status = ?, description = ? WHERE animal_id = ?";
  var parameter = [
    req.body.name,
    req.body.breed,
    req.body.age,
    req.body.gender,
    req.body.status,
    req.body.description,
    req.params.id,
  ];

  db.query(sql, parameter, function (error, result) {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(result);
  });
});

//delete animal (delete smaller rows first)
app.route("/animal/:id").delete(function (req, res) {
  var animalId = req.params.id;
  var sql1 = "DELETE FROM animal_adoption.image WHERE id = ?";
  var sql2 = "DELETE FROM animal_adoption.species WHERE animal_id = ?";
  var sql3 = "DELETE FROM animal_adoption.medical WHERE animal_id = ?";
  var sql4 = "DELETE FROM animal_adoption.animal WHERE animal_id = ?";

  db.query(sql1, [animalId], function (error1) {
    if (error1) return res.status(500).json({ error: error1.message });

    db.query(sql2, [animalId], function (error2) {
      if (error2) return res.status(500).json({ error: error2.message });

      db.query(sql3, [animalId], function (error3) {
        if (error3) return res.status(500).json({ error: error3.message });

        db.query(sql4, [animalId], function (error4, result) {
          if (error4) return res.status(500).json({ error: error4.message });

          res.json({ message: "Animal deleted", result: result });
        });
      });
    });
  });
});


//get species for a specific animal
app.route("/species/animal/:animal_id").get(function (req, res) {
  var sql = "SELECT * FROM animal_adoption.species WHERE animal_id = ?";
  var parameter = [req.params.animal_id];

  db.query(sql, parameter, function (error, result) {
    if (error) return res.status(500).json({ error: error.message });
    res.json(result);
  });
});

//post add species
app.route("/species").post(function (req, res) {
  var sql =
    "INSERT INTO animal_adoption.species (animal_id, species) VALUES (?, ?)";
  var parameter = [req.body.animal_id, req.body.species];

  db.query(sql, parameter, function (error, result) {
    if (error) return res.status(500).json({ error: error.message });
    res.json(result);
  });
});

//put update species
app.route("/species/:id").put(function (req, res) {
  var sql =
    "UPDATE animal_adoption.species SET animal_id = ?, species = ? WHERE species_id = ?";
  var parameter = [req.body.animal_id, req.body.species, req.params.id];

  db.query(sql, parameter, function (error, result) {
    if (error) return res.status(500).json({ error: error.message });
    res.json(result);
  });
});

//delete species
app.route("/species/:id").delete(function (req, res) {
  var sql = "DELETE FROM animal_adoption.species WHERE species_id = ?";
  var parameter = [req.params.id];

  db.query(sql, parameter, function (error, result) {
    if (error) return res.status(500).json({ error: error.message });
    res.json(result);
  });
});



//get medical by animal_id
app.route("/medical/animal/:animal_id").get(function (req, res) {
  var sql = "SELECT * FROM animal_adoption.medical WHERE animal_id = ?";
  var parameter = [req.params.animal_id];

  db.query(sql, parameter, function (error, result) {
    if (error) return res.status(500).json({ error: error.message });
    res.json(result);
  });
});

//post medical
app.route("/medical").post(function (req, res) {
  var sql =
    "INSERT INTO animal_adoption.medical (animal_id, vaccination_status, sterilised, medical_notes) VALUES (?, ?, ?, ?)";
  var parameter = [
    req.body.animal_id,
    req.body.vaccination_status,
    req.body.sterilised,
    req.body.medical_notes,
  ];

  db.query(sql, parameter, function (error, result) {
    if (error) return res.status(500).json({ error: error.message });
    res.json(result);
  });
});

//put medical by medical_id
app.route("/medical/:id").put(function (req, res) {
  var sql =
    "UPDATE animal_adoption.medical SET animal_id = ?, vaccination_status = ?, sterilised = ?, medical_notes = ? WHERE medical_id = ?";
  var parameter = [
    req.body.animal_id,
    req.body.vaccination_status,
    req.body.sterilised,
    req.body.medical_notes,
    req.params.id,
  ];

  db.query(sql, parameter, function (error, result) {
    if (error) return res.status(500).json({ error: error.message });
    res.json(result);
  });
});

//delete medical by medical_id
app.route("/medical/:id").delete(function (req, res) {
  var sql = "DELETE FROM animal_adoption.medical WHERE medical_id = ?";
  var parameter = [req.params.id];

  db.query(sql, parameter, function (error, result) {
    if (error) return res.status(500).json({ error: error.message });
    res.json(result);
  });
});


//get images for a specific animal
app.route("/image/animal/:animal_id").get(function (req, res) {
  var sql = "SELECT * FROM animal_adoption.image WHERE id = ?";
  var parameter = [req.params.animal_id];

  db.query(sql, parameter, function (error, result) {
    if (error) return res.status(500).json({ error: error.message });
    res.json(result);
  });
});

//post add image
app.route("/image").post(function (req, res) {
  var sql =
    "INSERT INTO animal_adoption.image (id, image_url, uploaded_at) VALUES (?, ?, ?)";
  var parameter = [req.body.animal_id, req.body.image_url, req.body.uploaded_at];

  db.query(sql, parameter, function (error, result) {
    if (error) return res.status(500).json({ error: error.message });
    res.json(result);
  });
});

//put update image
app.route("/image/:id").put(function (req, res) {
  var sql =
    "UPDATE animal_adoption.image SET id = ?, image_url = ?, uploaded_at = ? WHERE image_id = ?";
  var parameter = [
    req.body.animal_id,
    req.body.image_url,
    req.body.uploaded_at,
    req.params.id,
  ];

  db.query(sql, parameter, function (error, result) {
    if (error) return res.status(500).json({ error: error.message });
    res.json(result);
  });
});

//delete image by image_id
app.route("/image/:id").delete(function (req, res) {
  var sql = "DELETE FROM animal_adoption.image WHERE image_id = ?";
  var parameter = [req.params.id];

  db.query(sql, parameter, function (error, result) {
    if (error) return res.status(500).json({ error: error.message });
    res.json(result);
  });
});


app.listen(8081, "127.0.0.1");
console.log("Webserver is started on http://127.0.0.1:8081");