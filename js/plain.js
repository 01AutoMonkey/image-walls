
$("#tabs > button").click(function() {
    images.push({
        "label": "Group "+(images.length + 1),
        "images": [],
        "mode": 0
    });
    localStorage.setItem("images", JSON.stringify(images));
    renderTabs();
    renderImages();
});
$("#tabs select").change(function() {
    var mode = $(this).val();

    images[current_group].mode = mode;
    localStorage.setItem("images", JSON.stringify(images));

    setMode();
});

function renderTabs() {
    var html = "";
    for (var x in images) {
        if (current_group === parseInt(x)) {
            html += '<div id="group'+x+'" data-index="'+x+'" class="selected">'+images[x].label+'</div>';
        } else {
            html += '<div id="group'+x+'" data-index="'+x+'">'+images[x].label+'</div>';
        }
    }
    $("#tabs .items").html(html);
    var selected = $("#tabs .items div").get(current_group);
    $(selected).addClass("selected");

    $("#tabs .items div").click(function() {
        $("#tabs .items div").removeClass("selected");
        $(this).addClass("selected");

        var index = $(this).attr("data-index");
        current_group = index;
        localStorage.setItem("current_group", JSON.stringify(current_group));

        setMode();

        renderImages();
    })
}
function renderImages() {
    $("#container").html("");

    var i = 0;
    for (var x in images[current_group].images) {
        var image = new Image(); 
        image.onload = function() {
            var height = 200;

            var w = this.width;
            var h = this.height;

            var width = height * (w / h);

            $("#container").append(`<div class='img fill' src='`+this.src+`' style='background-image: url("`+this.src+`"); width: `+width+`px; height: `+height+`px'></div>`);

            i += 1;
            if (i === images[current_group].images.length) {
                $("#container .img").click(function() {
                    if (confirm("Remove image?")) {
                        var data = $(this).attr("src");
                        var i = images[current_group].images.indexOf(data);
                        images[current_group].images.splice(i, 1);
                        localStorage.setItem("images", JSON.stringify(images));
                        renderImages();
                    }
                })
            }
        };
        image.src = images[current_group].images[x];
    }
}
function addImage(data) {
    compressImage(data, function(data) {
        if (images[current_group].images.indexOf(data) < 0) {
            images[current_group].images.push(data);
            localStorage.setItem("images", JSON.stringify(images));
        }
        
        renderImages()
    })
}

function toDataUrl(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        var reader = new FileReader();
        reader.onloadend = function() {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = function(error) {
        this.onerror = null;
        this.open('GET', "https://cors-anywhere.herokuapp.com/"+url); // also: https://crossorigin.me/
        this.send();
    }
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}

function compressImage(data, callback) {
    var height = 400;
    var canvas = document.getElementById("canvas");
    var img = new Image();
    img.onload = function () {
        var width = height * (img.width / img.height);
    
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
    
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
        var jpg = canvas.toDataURL('image/jpeg', 0.75);
        var png = canvas.toDataURL('image/png');
        var image = jpg;
        if (png.length < jpg.length) {
            image = png;
        }
        callback(image);
    }
    img.src = data;
}

var dropzone = document.getElementById('body');
dropzone.addEventListener("dragenter", function(e) {
    e = e || event;
    e.stopPropagation();
    e.preventDefault();

    return false;
}, false);
dropzone.addEventListener("dragover", function(e) {
    e = e || event;
    e.stopPropagation();
    e.preventDefault();

    return false;
}, false);
dropzone.addEventListener("drop", function(e) {
    e = e || event;
    e.stopPropagation();
    e.preventDefault();

    var dt = e.dataTransfer;

    for (var x = 0; x < dt.items.length; x += 1) {
        var file;
        if (dt.items[x].type.indexOf("image") === 0) {
            var file = dt.items[x].getAsFile();

            var reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onloadend = function() {
                addImage(this.result);
            }
        } else if (dt.items[x].type == "text/uri-list") {
            var img_url = dt.getData("text/plain");

            toDataUrl(img_url, function(myBase64) {
                addImage(myBase64);
            });
        } else {
            continue;
        }
    }

    return false;
}, false);



// Main
var current_group = localStorage.getItem("current_group");
if (!current_group) {
    current_group = 0;
} else {
    current_group = JSON.parse(current_group);
}

var images = localStorage.getItem("images");
if (!images) {
    images = [
        {
            "label"  : "Group 1",
            "images" : [],
            "mode"   : 0
        }
    ];
} else {
    images = JSON.parse(images);
}

var modes = ["Fixed Height", "Poster", "Portrait", "Rectangle"]
function setMode() {
    for (var x in modes) {
        $("#container").removeClass("mode_"+x);
    }
    $("#container").addClass("mode_"+(images[current_group].mode||0));
}
$("#tabs select").val(images[current_group].mode||0);

renderTabs();
setMode();
renderImages();
