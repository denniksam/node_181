document.addEventListener("submit",(e)=>{
    e.preventDefault();
    const form = e.target;

    const title = form.querySelector("input[name=title]");
    if(!title) throw "Data transfer error: input[name=title] not found";

    const descr = form.querySelector("input[name=description]");
    if(!descr) throw "Data transfer error: input[name=description] not found";
    const place = form.querySelector("input[name=place]");
    if(!place) throw "Data transfer error: input[name=place] not found";
    const picture = form.querySelector("input[name=picture]");
    if(!picture) throw "Data transfer error: input[name=picture] not found";
    // TODO: data validation

    const formData = new FormData();
    formData.append("title", title.value);
    formData.append("description", descr.value);
    // place optional, include if not empty
    if(place.value.length > 0)
        formData.append("place", place.value);
    formData.append("picture", picture.files[0]);
/*
    fetch("/api/picture?" + new URLSearchParams(formData).toString(), {
        method: "GET"
    }).then(r=>r.text()).then(console.log);
    */
    fetch("/api/picture", {
        method: "POST",
        body: formData  // new URLSearchParams(formData).toString()
    }).then(r=>r.text()).then(console.log);
});

document.addEventListener("DOMContentLoaded",()=>{
    fetch("/api/picture")
    .then(r=>r.text())
    .then(t=>{
        // console.log(t);
        const j = JSON.parse(t);
        const cont = document.getElementById("gallery-container");
        fetch("/templates/picture.tpl").then(r=>r.text()).then(tpl=>{
            var html = "";
            for(let p of j){
                html += tpl.replace("{{id}}",p.id_str)
                           .replace("{{title}}",p.title)
                           .replace("{{description}}",p.description)
                           .replace("{{place}}",p.place)
                           .replace("{{filename}}",p.filename);
            }
            cont.innerHTML = html;
            addToolbuttonListeners();
        });
    });
});

async function addToolbuttonListeners() {
    for(let b of document.querySelectorAll(".tb-delete"))
        b.addEventListener("click",tbDelClick);
    for(let b of document.querySelectorAll(".tb-edit"))
        b.addEventListener("click",tbEditClick);
    for(let b of document.querySelectorAll(".tb-download"))
        b.addEventListener("click",tbDownloadClick);
}

function tbDelClick(e) {
    if(!confirm("Are you sure?")) return;

    const div = e.target.closest("div");
    const picId = div.getAttribute("picId");
    // console.log(picId);
    fetch("/api/picture",{
        method: "delete",
        headers: {
            'Content-Type': 'application/json'
        },
        body: `{"id":"${picId}"}`
    }).then(r=>r.json()).then(j=>{
        // в ответе сервера должно быть поле result, в нем (affectedRows)
        // если 1 - было удаление, 0 - не было
        if(typeof j.result == 'undefined' ) alert("Some error");
        else if (j.result == 1){
            // удалить div из контейнера картин
            div.remove();
            alert("Delete completed!");
        }
        else alert("Deleted fail");
    });
}

function tbEditClick(e){
    const div = e.target.closest("div");
    const picId = div.getAttribute("picId");
    // console.log(picId);
    const place = div.querySelector("i");
    if(!place) throw "EditClick: place(<i>) not found";
    const descr = div.querySelector("p");
    if(!descr) throw "EditClick: description(<p>) not found";

    // toggle effect
    if( typeof div.savedPlace == 'undefined'){  // first click
        div.savedPlace = place.innerHTML;
        div.savedDecription = descr.innerHTML;
        // editable content
        place.setAttribute("contenteditable", "true");
        descr.setAttribute("contenteditable", "true");
        descr.focus();
    
        console.log(div.savedPlace, div.savedDecription);
    } else {  // second click
        // no changes - no fetch
        // one field changed - one filed fetched
        let data = {} ;
        if(div.savedPlace != place.innerHTML) data.place = place.innerHTML;
        if(div.savedDecription != descr.innerHTML) data.description = descr.innerHTML;
        if(Object.keys(data).length > 0){
            data.id = picId;
            fetch('/api/picture',{
                method: "put",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(r=>r.text()).then(console.log);
        }
        delete div.savedPlace;
        delete div.savedDecription;
        place.removeAttribute("contenteditable");
        descr.removeAttribute("contenteditable");

    }
}

function tbDownloadClick(e){
    const div = e.target.closest("div");
    const picId = div.getAttribute("picId");
    console.log(picId);
    window.location = "/download?picid=" + picId;
}