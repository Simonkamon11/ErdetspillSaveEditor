function el(id) {
    return document.getElementById(id)
}

const dropZone = el("dropZone");
const fileInput = el("fileInput");

dropZone.addEventListener("click", () => {
    fileInput.click();
});

dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

var file;
dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("dragover");

    const files = event.dataTransfer.files;

    if(files.length === 0) return;

    file = files[0];
    handleFile();
});

fileInput.addEventListener("change", () => {
    if(fileInput.files.length === 0) return;

    file = fileInput.files[0];
    handleFile();
});

var CONTENT;
async function handleFile() {
    if(!file.name.toLowerCase().endsWith(".cfg")) {
        alert("Vennligst velg en .cfg-fil!");
        return;
    }

    CONTENT = String(await file.text());

    // console.log("Filnavn:", file.name);
    // console.log("Filinnhold:", CONETNT);

    startEditor(CONTENT);
}

function startEditor(data) {
    el("download-btn").style.display = "block";
    if(data.includes("[inventar]")) {
        const inventoryStart = data.slice(data.indexOf("[inventar]")+1, -1)
        const inventoryEnd = inventoryStart.indexOf("[")
        const inventoryData = inventoryStart.slice(1, inventoryEnd+1)
        startInventory(inventoryData)
    } else {
        startInventory(null)
    }
}

function createSaveData() {
    const inventoryData = createInventoryData();

    var data = CONTENT;
    if(data.includes("[inventar]")) {
        data = data.replace(
        /\[inventar\][\s\S]*?(?=\n\[|$)/,
        `[inventar]\n\n${inventoryData}`
        );
    } else {
        data += `\n[inventar]\n\n${inventoryData}`;
    }
    return data
}

el("download-btn").addEventListener("click", downloadSave);
function downloadSave() {
    const newData = createSaveData();

    const blob = new Blob(
        [newData],
        { type: "text/plain" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = file.name;

    link.click();

    URL.revokeObjectURL(url);
}

let inventory = {};
function startInventory(data) {
    dropZone.style.display = "none";
    el("inventory-text").style.display = "block";

    const itemButtons = document.querySelectorAll("#items button");
    const resetBtn = el("reset-btn");
    resetBtn.addEventListener("click", () => {
        inventory = {};
        updateInventory();
    });
    const inventoryElement = el("inventory");
    inventoryElement.style.display = "block";

    itemButtons.forEach(button => {
        button.style.display = "inline-block";
        if(button.id !== "reset-btn") {
            const item = button.dataset.item;

            if(data !== null) {
                const lines = data.split("\n");
                for(const line of lines) {
                    const [item, value] = line.split("=");
                    if(item !== undefined && value !== undefined) {
                        inventory[item.trim()] = Number(value.trim());
                    }
                }
            }

            button.addEventListener("click", () => {
                if (inventory[item] === undefined) {
                    inventory[item] = 1;
                } else {
                    inventory[item]++;
                }
                updateInventory();
            });
        }
    });
    updateInventory();

    function updateInventory() {
        inventoryElement.innerHTML = "";

        for(const item in inventory) {
            const element = document.createElement("p");

            element.textContent =
                `${item}: ${inventory[item]}`;

            inventoryElement.appendChild(element);
        }
    }
}

function createInventoryData() {
    let result = "";

    for (const item in inventory) {
        result += `${item}=${inventory[item]}\n`;
    }

    return result;
}