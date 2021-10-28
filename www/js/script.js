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
}
function tbDelClick(e) {
    const div = e.target.closest("div");
    const picId = div.getAttribute("picId");
    console.log(picId);
    fetch("/api/picture",{
        method: "delete",
        headers: {
            'Content-Type': 'application/json'
        },
        body: `{"id":"${picId}a"}`
    }).then(r=>r.json()).then(console.log);
}