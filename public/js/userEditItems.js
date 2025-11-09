document.getElementById('userInputSec').addEventListener('submit', async (event) => {

    event.preventDefault();

    const name = document.getElementById('name').value;

    const height = document.getElementById('height').value;
    const width = document.getElementById('width').value;
    const length = document.getElementById('length').value;

    const errorText = document.getElementById('errorText');
    if (!name) {
        errorText.style.opacity = '1';
        errorText.textContent = 'Name is required';
        return;
    }
    if (!height) {
        errorText.style.opacity = '1';
        errorText.textContent = 'Height is required';
        return;
    }
    if (!width) {
        errorText.style.opacity = '1';
        errorText.textContent = 'Height is required';
        return;
    }
    if (!length) {
        errorText.style.opacity = '1';
        errorText.textContent = 'Length is required';
        return;
    }
    errorText.style.opacity = '0';
    await fetch('/addNewObj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, height, width, length }),
    });
    loadItems();
});

function get_item_object(item){
    return `
            <div class="card mb-12" style="width: 190px;">
            <div style="text-align: center">${item.name}</div>
                <img src="${item.url}" alt="">
                <div class="card-body p-0">
                    <div class="container" style="color: olivedrab; font-size: small; padding: 2px;">
                        <div class="row">
                            <div class="col-4">Height</div>
                            <div class="col-4">Width</div>
                            <div class="col-4">Length</div>
                        </div>
                        <div class="row">
                            <div class="col-4">${item.height}</div>
                            <div class="col-4">${item.width}</div>
                            <div class="col-4">${item.length}</div>
                        </div>
                    </div>
                    <div class="btn-group w-100" role="group">
                        <button class="btn btn-danger delete-btn" data-id="${item._id}" onclick="onDelete(event)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>`
}

function onDelete(event) {
    const button = event.target;
    const itemId = button.getAttribute('data-id')

    fetch(`/deleteObj/${itemId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }})
        .then(function(response) {
            return response.json();
        }).then(function() {
        loadItems();
    });
}

function loadItems() {
    fetch('/getAllObjs')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            document.getElementById('item_section').innerHTML = "";
            for (let i = 0; i < data.length; i++) {
                document.getElementById('item_section').innerHTML = document.getElementById('item_section').innerHTML + get_item_object(data[i]);
            }
        });
}
document.addEventListener('DOMContentLoaded', loadItems);