function loadAnimalData() {
    var animalArray = [];

    fetch("/animal", { method: "GET" })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error: Unable to load animals.");
            }
            return response.json();
        })
        .then(data => {
            animalArray = data;
            console.log("Animals:", animalArray);
            insertDynamicAnimals(animalArray);
        })
        .catch(error => {
            console.error("Error:", error);
        });
}

function insertDynamicAnimals(arrayOfAnimals) {
    var dynamicAnimalList = document.getElementById("dynamicAnimalDataList");

    var newContent = "<table><tr>";

    for (var i = 0; i < arrayOfAnimals.length; i++) {
        var imgId = "animalImg_" + arrayOfAnimals[i].animal_id;

        newContent +=
            "<td>" +
                "<h4>" + arrayOfAnimals[i].name + "</h4>" +
                "<img id='" + imgId + "' src='images/ugi.jpg' width='150' height='100'><br>" +
                "Breed: " + arrayOfAnimals[i].breed + "<br>" +
                "Age: " + arrayOfAnimals[i].age + "<br>" +
                "Gender: " + arrayOfAnimals[i].gender + "<br>" +
                "Status: " + arrayOfAnimals[i].status + "<br><br>" +
                "<button type='button' onclick='editAnimal(this)' animalId='" + arrayOfAnimals[i].animal_id + "'>Edit</button> " +
                "<button type='button' onclick='deleteAnimalData(this)' animalId='" + arrayOfAnimals[i].animal_id + "'>Delete</button> " +
                "<button type='button' onclick='aboutAnimal(this)' animalId='" + arrayOfAnimals[i].animal_id + "'>About</button>" +
            "</td>";

        if ((i + 1) % 3 === 0 && i < arrayOfAnimals.length - 1) {
            newContent += "</tr><tr>";
        }
    }

    newContent += "</tr></table>";
    dynamicAnimalList.innerHTML = newContent;

    //load real images after table is loaded
    for (var j = 0; j < arrayOfAnimals.length; j++) {
        loadAnimalImage(arrayOfAnimals[j].animal_id);
    }
}

function loadAnimalImage(animalId) {
    var api_url = "/image/animal/" + animalId;

    fetch(api_url, { method: "GET" })
        .then(response => {
            // if no image row exists, backend might return the error
            if (!response.ok) {
                throw new Error("No image found");
            }
            return response.json();
        })
        .then(data => {
            if (data.length > 0) {
                var imgTag = document.getElementById("animalImg_" + animalId);
                if (imgTag) {
                    imgTag.src = fixImagePath(data[0].image_url);
                }
            }
        })
        .catch(error => {
            console.log("No image for animal:", animalId);
        });
}

function deleteAnimalData(buttonElement) {
    var id = buttonElement.getAttribute("animalId");
    var api_url = "/animal/" + id;

    fetch(api_url, { method: "DELETE" })
        .then(response => {
            if (!response.ok) {
                throw new Error("Delete failed");
            }
            return response.json();
        })
        .then(data => {
            location.href = "/adoption.html";
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Delete failed. Check console + server logs.");
        });
}

function editAnimal(btnElement) {
    var id = btnElement.getAttribute("animalId");
    location.href = "/update_animal.html?id=" + id;
}

function aboutAnimal(btnElement) {
    var id = btnElement.getAttribute("animalId");
    location.href = "/animalDetail.html?id=" + id;
}






//details page
var currentAnimalId = null;

function loadAnimalDetail() {
    var params = new URLSearchParams(location.search);
    var id = params.get("id");

    if (id == null) {
        alert("No animal id found in URL!");
        return;
    }

    currentAnimalId = id;

    loadAnimalBasicInfo(id);
    loadAnimalSpecies(id);
    loadAnimalMedical(id);
    loadAnimalImages(id);
}

function loadAnimalBasicInfo(id) {
    var api_url = "/animal/" + id;

    fetch(api_url, { method: "GET" })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error loading animal info");
            }
            return response.json();
        })
        .then(data => {
            if (data.length > 0) {
                setAnimalBasicInfo(data[0]);
            } else {
                alert("Animal not found");
            }
        })
        .catch(error => console.error("Error:", error));
}

function setAnimalBasicInfo(animal) {
    document.getElementById("animalName").innerHTML = animal.name;
    document.getElementById("breed").innerHTML = animal.breed;
    document.getElementById("age").innerHTML = animal.age;
    document.getElementById("gender").innerHTML = animal.gender;
    document.getElementById("status").innerHTML = animal.status;
    document.getElementById("description").innerHTML = animal.description;
}

function loadAnimalSpecies(id) {
    var api_url = "/species/animal/" + id;

    fetch(api_url, { method: "GET" })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error loading species");
            }
            return response.json();
        })
        .then(data => {
            setSpeciesInfo(data);
        })
        .catch(error => console.error("Error:", error));
}

function setSpeciesInfo(speciesArray) {
    var speciesContainer = document.getElementById("speciesList");

    if (speciesArray.length == 0) {
        speciesContainer.innerHTML = "No species information.";
        return;
    }

    var newContent = "<ul>";
    for (var i = 0; i < speciesArray.length; i++) {
        newContent += "<li>" + speciesArray[i].species + "</li>";
    }
    newContent += "</ul>";

    speciesContainer.innerHTML = newContent;
}

function loadAnimalMedical(id) {
    var api_url = "/medical/animal/" + id;

    fetch(api_url, { method: "GET" })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error loading medical info");
            }
            return response.json();
        })
        .then(data => {
            setMedicalInfo(data);
        })
        .catch(error => console.error("Error:", error));
}

function setMedicalInfo(medicalArray) {
    var medicalContainer = document.getElementById("medicalInfo");

    if (medicalArray.length == 0) {
        medicalContainer.innerHTML = "No medical information.";
        return;
    }

    var medical = medicalArray[0];

    var vaccinatedText = (medical.vaccination_status == 1) ? "Yes" : "No";
    var sterilisedText = (medical.sterilised == 1) ? "Yes" : "No";

    var newContent =
        "<b>Vaccinated:</b> " + vaccinatedText + "<br>" +
        "<b>Sterilised:</b> " + sterilisedText + "<br><br>" +
        "<b>Medical Notes:</b><br>" +
        "<p>" + (medical.medical_notes || "") + "</p>";

    medicalContainer.innerHTML = newContent;
}

function loadAnimalImages(id) {
    var api_url = "/image/animal/" + id;

    fetch(api_url, { method: "GET" })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error loading images");
            }
            return response.json();
        })
        .then(data => {
            setImages(data);
        })
        .catch(error => console.error("Error:", error));
}

function setImages(imageArray) {
    var gallery = document.getElementById("imageGallery");

    if (imageArray.length == 0) {
        gallery.innerHTML = "No images found.";
        return;
    }

    //main image
    document.getElementById("mainImage").src = fixImagePath(imageArray[0].image_url);
    var newContent = "<table><tr>";

    for (var i = 0; i < imageArray.length; i++) {
        var imgUrl = fixImagePath(imageArray[i].image_url);
        newContent += "<td><img src='" + imgUrl + "' width='150' height='100'></td>";

        if ((i + 1) % 3 === 0 && i < imageArray.length - 1) {
            newContent += "</tr><tr>";
        }
    }

    newContent += "</tr></table>";
    gallery.innerHTML = newContent;
}

function fixImagePath(img) {
    if (img == null || img.trim() === "") return "images/ugi.jpg";
    if (img.indexOf("http") === 0) return img;
    if (img.indexOf("/") !== -1) return img;
    return "images/" + img;
}

function editThisAnimal() {
    location.href = "/update_animal.html?id=" + currentAnimalId;
}

function deleteThisAnimal() {
    var confirmDelete = confirm("Are you sure you want to delete this animal?");
    if (!confirmDelete) return;

    var api_url = "/animal/" + currentAnimalId;

    fetch(api_url, { method: "DELETE" })
        .then(response => {
            if (!response.ok) {
                throw new Error("Delete failed");
            }
            return response.json();
        })
        .then(data => {
            location.href = "/adoption.html";
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Delete failed");
        });
}

function goBack() {
    location.href = "/adoption.html";
}





//update page
function loadAnimalForUpdate() {
    var params = new URLSearchParams(location.search);
    var id = params.get("id");

    if (id == null) {
        alert("No animal id found in URL!");
        return;
    }

    var api_url = "/animal/" + id;

    fetch(api_url, { method: "GET" })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error loading animal for update");
            }
            return response.json();
        })
        .then(data => {
            if (data.length > 0) {
                setAnimalUpdateForm(data[0]);
            } else {
                alert("Animal not found");
            }
        })
        .catch(error => console.error("Error:", error));
}
function setAnimalUpdateForm(animal) {
    document.getElementById("name_tb").value = animal.name;
    document.getElementById("breed_tb").value = animal.breed;
    document.getElementById("age_tb").value = animal.age;
    document.getElementById("gender_tb").value = animal.gender;
    document.getElementById("status_tb").value = animal.status;
    document.getElementById("description_tb").value = animal.description;
    document.getElementById("animal_id_tb").value = animal.animal_id;
}

function updateAnimalData() {
    var formElement = document.getElementById("updateAnimalForm");
    var formData = new FormData(formElement);
    var animalData = Object.fromEntries(formData.entries());

    var id = animalData.animal_id;
    var api_url = "/animal/" + id;

    var bodyObj = {
        name: animalData.name,
        breed: animalData.breed,
        age: animalData.age,
        gender: animalData.gender,
        status: animalData.status,
        description: animalData.description
    };

    fetch(api_url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyObj)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Update failed");
            }
            return response.json();
        })
        .then(data => {
            location.href = "/adoption.html";
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Update failed");
        });
}



//add all like animal,species,medical and image
function addAnimalFullData() {
    var formElement = document.getElementById("insertForm");
    var formData = new FormData(formElement);
    var allData = Object.fromEntries(formData.entries());

    var animalObj = {
        name: allData.name,
        breed: allData.breed,
        age: allData.age,
        gender: allData.gender,
        status: allData.status,
        description: allData.description
    };

    //add animal
    fetch("/animal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(animalObj)
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to add animal");
            return response.json();
        })
        .then(result => {
            var newAnimalId = result.insertId;

            if (newAnimalId == null) {
                alert("Animal created but insertId missing.");
                location.href = "/adoption.html";
                return;
            }

            //add species
            var speciesObj = { animal_id: newAnimalId, species: allData.species };

            return fetch("/species", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(speciesObj)
            }).then(r1 => {
                if (!r1.ok) throw new Error("Failed to add species");
                return r1.json().then(() => newAnimalId); 
            });
        })
        .then(newAnimalId => {
            //add medical
            var medicalObj = {
                animal_id: newAnimalId,
                vaccination_status: Number(allData.vaccination_status),
                sterilised: Number(allData.sterilised),
                medical_notes: allData.medical_notes
            };

            return fetch("/medical", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(medicalObj)
            }).then(r2 => {
                if (!r2.ok) throw new Error("Failed to add medical");
                return r2.json().then(() => newAnimalId);
            });
        })
        .then(newAnimalId => {
            //add image
            var imageObj = {
                animal_id: newAnimalId,
                image_url: allData.image_url,
                uploaded_at: null
            };

            return fetch("/image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(imageObj)
            }).then(r3 => {
                if (!r3.ok) throw new Error("Failed to add image");
                return r3.json();
            });
        })
        .then(() => {
            location.href = "/adoption.html";
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Add full animal failed. Check console/server logs.");
        });
}



//update everything like animal,species,medical and imagews
function loadAnimalFullForUpdate() {
    var params = new URLSearchParams(location.search);
    var id = params.get("id");

    if (id == null) {
        alert("No animal id found in URL!");
        return;
    }

    document.getElementById("animal_id_tb").value = id;

    //getting info from animal table
    fetch("/animal/" + id, { method: "GET" })
        .then(r => r.json())
        .then(data => {
            if (data.length > 0) {
                var a = data[0];
                document.getElementById("name_tb").value = a.name;
                document.getElementById("breed_tb").value = a.breed;
                document.getElementById("age_tb").value = a.age;
                document.getElementById("gender_tb").value = a.gender;
                document.getElementById("status_tb").value = a.status;
                document.getElementById("description_tb").value = a.description;
            }
        })
        .catch(err => console.error(err));

    //getting info from the species tablw
    fetch("/species/animal/" + id, { method: "GET" })
        .then(r => r.json())
        .then(data => {
            if (data.length > 0) {
                document.getElementById("species_id_tb").value = data[0].species_id;
                document.getElementById("species_tb").value = data[0].species;
            }
        })
        .catch(err => console.error(err));

    //getting info frm the medical table
    fetch("/medical/animal/" + id, { method: "GET" })
        .then(r => r.json())
        .then(data => {
            if (data.length > 0) {
                document.getElementById("medical_id_tb").value = data[0].medical_id;
                document.getElementById("vaccination_tb").value = String(data[0].vaccination_status);
                document.getElementById("sterilised_tb").value = String(data[0].sterilised);
                document.getElementById("medical_notes_tb").value = data[0].medical_notes;
            }
        })
        .catch(err => console.error(err));

    //getting info from the image tble
    fetch("/image/animal/" + id, { method: "GET" })
        .then(r => r.json())
        .then(data => {
            if (data.length > 0) {
                document.getElementById("image_id_tb").value = data[0].image_id;
                document.getElementById("image_url_tb").value = data[0].image_url;
            }
        })
        .catch(err => console.error(err));
}

function updateAnimalFullData() {
    var formElement = document.getElementById("updateAnimalForm");
    var formData = new FormData(formElement);
    var allData = Object.fromEntries(formData.entries());

    var animalId = allData.animal_id;

    var animalObj = {
        name: allData.name,
        breed: allData.breed,
        age: allData.age,
        gender: allData.gender,
        status: allData.status,
        description: allData.description
    };

    //update animal first
    fetch("/animal/" + animalId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(animalObj)
    })
        .then(r => {
            if (!r.ok) throw new Error("Failed to update animal");
            return r.json();
        })
        .then(() => {
            //species(update and insert)
            if (allData.species != null && allData.species.trim() !== "") {
                var speciesObj = { animal_id: animalId, species: allData.species };

                if (allData.species_id != null && allData.species_id !== "") {
                    fetch("/species/" + allData.species_id, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(speciesObj)
                    }).catch(e => console.error(e));
                } else {
                    fetch("/species", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(speciesObj)
                    }).catch(e => console.error(e));
                }
            }

            //medical(update and insert)
            var medicalObj = {
                animal_id: animalId,
                vaccination_status: Number(allData.vaccination_status),
                sterilised: Number(allData.sterilised),
                medical_notes: allData.medical_notes
            };

            if (allData.medical_id != null && allData.medical_id !== "") {
                fetch("/medical/" + allData.medical_id, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(medicalObj)
                }).catch(e => console.error(e));
            } else {
                fetch("/medical", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(medicalObj)
                }).catch(e => console.error(e));
            }

            //image(update and insert)
            if (allData.image_url != null && allData.image_url.trim() !== "") {
                var imageObj = { animal_id: animalId, image_url: allData.image_url, uploaded_at: null };

                if (allData.image_id != null && allData.image_id !== "") {
                    fetch("/image/" + allData.image_id, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(imageObj)
                    }).catch(e => console.error(e));
                } else {
                    fetch("/image", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(imageObj)
                    }).catch(e => console.error(e));
                }
            }

            //back to adoption.html
            location.href = "/adoption.html";
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Update failed. Check console + server logs.");
        });
}



// SEARCHHHHHHHHHHH(additional feature)
function searchAnimals() {
    var name = document.getElementById("searchName").value;
    var status = document.getElementById("searchStatus").value;
    var species = document.getElementById("searchSpecies").value;

    var url = "/animal/search?name=" + encodeURIComponent(name) +
              "&status=" + encodeURIComponent(status) +
              "&species=" + encodeURIComponent(species);

    fetch(url, { method: "GET" })
        .then(response => {
            if (!response.ok) {
                throw new Error("Search API failed. Status: " + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Search results:", data);
            insertDynamicAnimals(data);
        })
        .catch(error => {
            console.error("Search error:", error);
            alert("Search failed. Check console for errors.");
        });
}
