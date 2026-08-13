const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const gallery = document.getElementById("gallery");
const emptyState = document.getElementById("emptyState");
const clearButton = document.getElementById("clearButton");
const status = document.getElementById("status");
const imageCount = document.getElementById("imageCount");

let images = JSON.parse(localStorage.getItem("imageDatabase") || "[]");

function saveImages() {
  localStorage.setItem("imageDatabase", JSON.stringify(images));
}

function formatSize(bytes) {
  if (bytes < 1024) {
    return bytes + " B";
  }

  if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + " KB";
  }

  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function updateCount() {
  const count = images.length;

  imageCount.textContent =
    count === 1 ? "תמונה אחת" : `${count} תמונות`;
}

function render() {
  gallery.innerHTML = "";

  emptyState.style.display =
    images.length === 0 ? "block" : "none";

  images.forEach((image) => {
    const card = document.createElement("article");
    card.className = "image-card";

    const img = document.createElement("img");
    img.className = "image-preview";
    img.src = image.data;
    img.alt = image.name;

    const info = document.createElement("div");
    info.className = "image-info";

    const name = document.createElement("div");
    name.className = "file-name";
    name.textContent = image.name;

    const size = document.createElement("div");
    size.className = "file-size";
    size.textContent = formatSize(image.size);

    const actions = document.createElement("div");
    actions.className = "image-actions";

    const copy = document.createElement("button");
    copy.className = "copy-button";
    copy.textContent = "העתק קישור";

    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(image.data);
        status.textContent = "הקישור הועתק!";
      } catch {
        status.textContent = "לא ניתן להעתיק את הקישור.";
      }

      setTimeout(() => {
        status.textContent = "";
      }, 2000);
    });

    const remove = document.createElement("button");
    remove.className = "delete-button";
    remove.textContent = "מחיקה";

    remove.addEventListener("click", () => {
      images = images.filter((item) => item.id !== image.id);
      saveImages();
      render();
    });

    actions.append(copy, remove);
    info.append(name, size, actions);
    card.append(img, info);
    gallery.appendChild(card);
  });

  updateCount();
}

function addFiles(files) {
  const imageFiles = [...files].filter((file) =>
    file.type.startsWith("image/")
  );

  if (!imageFiles.length) {
    status.textContent = "בחר קובצי תמונה בלבד.";
    return;
  }

  imageFiles.forEach((file) => {
    const reader = new FileReader();

    reader.onload = () => {
      images.unshift({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        data: reader.result
      });

      saveImages();
      render();
    };

    reader.readAsDataURL(file);
  });

  status.textContent =
    `${imageFiles.length} תמונות נוספו.`;

  setTimeout(() => {
    status.textContent = "";
  }, 2500);
}

fileInput.addEventListener("change", (event) => {
  addFiles(event.target.files);
  fileInput.value = "";
});

["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("dragging");
  });
});

dropZone.addEventListener("drop", (event) => {
  addFiles(event.dataTransfer.files);
});

clearButton.addEventListener("click", () => {
  if (!images.length) {
    return;
  }

  if (confirm("למחוק את כל התמונות מהתצוגה?")) {
    images = [];
    saveImages();
    render();
  }
});

render();
