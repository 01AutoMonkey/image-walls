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
    $("#tabs .items div").click(function() {
        $("#tabs .items div").removeClass("selected");
        $(this).addClass("selected");

        var index = $(this).attr("data-index");
        current_group = index;
        localStorage.setItem("current_group", JSON.stringify(current_group));

        renderImages();
    })
}
function renderImages() {
    $("#container").html("");
    for (var x in images[current_group].images) {
        $("#container").append("<img src='"+images[current_group].images[x]+"'>");
    }
    $("#container img").click(function() {
        if (confirm("Remove image?")) {
            var data = $(this).attr("src");
            var i = images[current_group].images.indexOf(data);
            images[current_group].images.splice(i, 1);
            localStorage.setItem("images", JSON.stringify(images));
            renderImages();
        }
    })
}
function addImage(data) {
    if (images[current_group].images.indexOf(data) < 0) {
        images[current_group].images.push(data);
        localStorage.setItem("images", JSON.stringify(images));
    }
    
    renderImages()
}

function toDataUrl(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        console.log("onload...")
        var reader = new FileReader();
        reader.onloadend = function() {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = function(error) {
        this.onerror = null;
        this.open('GET', "https://cors.io/?"+url);
        this.send();
    }
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
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
            "label"  : "First",
            "images" : []
        },
        {
            "label"  : "Second",
            "images" : []
        }
    ];
} else {
    images = JSON.parse(images);
}

renderTabs();
renderImages();
