const SUPABASE_URL = "https://ildsvtjxnwibeteyzjnd.supabase.co";
const SUPABASE_KEY = "sb_publishable_vhm95tfhxdNjB33lOsaaaQ_KZf-msmZ";
const BUCKET = "images";

const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const gallery = document.getElementById("gallery");
const emptyState = document.getElementById("emptyState");
const status = document.getElementById("status");
const imageCount = document.getElementById("imageCount");

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`
};

async function uploadFile(file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`,
    {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": file.type,
        "x-upsert": "false"
      },
      body: file
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return path;
}

function getPublicUrl(path) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

async function uploadFiles(files) {
  const imageFiles = [...files].filter(file =>
    file.type.startsWith("image/")
  );

  if (!imageFiles.length) {
    status.textContent = "בחר קובצי תמונה בלבד.";
    return;
  }

  status.textContent = "מעלה תמונות...";

  let uploaded = 0;

  for (const file of imageFiles) {
    try {
      const path = await uploadFile(file);
      const url = getPublicUrl(path);

      addImageToGallery({
        name: file.name,
        size: file.size,
        url
      });

      uploaded++;
      status.textContent =
        `הועלו ${uploaded} מתוך ${imageFiles.length}`;
    } catch (error) {
      console.error(error);
      status.textContent = "אירעה שגיאה בהעלאה.";
    }
  }

  if (uploaded === imageFiles.length) {
    status.textContent = "כל התמונות הועלו בהצלחה!";
  }
}

function addImageToGallery(image) {
  emptyState.style.display = "none";

  const card = document.createElement("article");
  card.className = "image-card";

  const img = document.createElement("img");
  img.className = "image-preview";
  img.src = image.url;
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

  copy.onclick = async () => {
    await navigator.clipboard.writeText(image.url);
    copy.textContent = "הועתק ✓";

    setTimeout(() => {
      copy.textContent = "העתק קישור";
    }, 1500);
  };

  actions.appendChild(copy);

  info.append(name, size, actions);
  card.append(img, info);
  gallery.prepend(card);

  updateCount();
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function updateCount() {
  const count = gallery.children.length;

  imageCount.textContent =
    count === 1 ? "תמונה אחת" : `${count} תמונות`;
}

fileInput.addEventListener("change", event => {
  uploadFiles(event.target.files);
  fileInput.value = "";
});

["dragenter", "dragover"].forEach(eventName => {
  dropZone.addEventListener(eventName, event => {
    event.preventDefault();
    dropZone.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach(eventName => {
  dropZone.addEventListener(eventName, event => {
    event.preventDefault();
    dropZone.classList.remove("dragging");
  });
});

dropZone.addEventListener("drop", event => {
  uploadFiles(event.dataTransfer.files);
});

updateCount();
