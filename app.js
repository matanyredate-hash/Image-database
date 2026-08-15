const SUPABASE_URL =
  "https://ildsvtjxnwibeteyzjnd.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_vhm95tfhxdNjB33lOsaaaQ_KZf-msmZ";

const BUCKET = "images";

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`
};


/* Elements */

const foldersPage =
  document.getElementById("foldersPage");

const folderPage =
  document.getElementById("folderPage");

const foldersGrid =
  document.getElementById("foldersGrid");

const filesGrid =
  document.getElementById("filesGrid");

const noFolders =
  document.getElementById("noFolders");

const noFiles =
  document.getElementById("noFiles");

const folderCount =
  document.getElementById("folderCount");

const fileCount =
  document.getElementById("fileCount");

const folderTitle =
  document.getElementById("folderTitle");

const uploadStatus =
  document.getElementById("uploadStatus");

const newFolderBtn =
  document.getElementById("newFolderBtn");

const backBtn =
  document.getElementById("backBtn");

const fileInput =
  document.getElementById("fileInput");

const autoBtn =
  document.getElementById("autoBtn");

const folderModal =
  document.getElementById("folderModal");

const closeModal =
  document.getElementById("closeModal");

const folderName =
  document.getElementById("folderName");

const createFolderBtn =
  document.getElementById("createFolderBtn");

const viewer =
  document.getElementById("viewer");

const viewerImage =
  document.getElementById("viewerImage");

const viewerName =
  document.getElementById("viewerName");

const closeViewer =
  document.getElementById("closeViewer");

const prevBtn =
  document.getElementById("prevBtn");

const nextBtn =
  document.getElementById("nextBtn");

const viewerPlay =
  document.getElementById("viewerPlay");

const viewerPause =
  document.getElementById("viewerPause");


/* State */

let currentFolder = null;
let currentFiles = [];
let viewerIndex = 0;
let autoTimer = null;


/* API */

async function api(path, options = {}) {

  const response =
    await fetch(
      `${SUPABASE_URL}/rest/v1/${path}`,
      {
        ...options,

        headers: {
          ...headers,

          "Content-Type":
            "application/json",

          ...(options.headers || {})
        }
      }
    );

  if (!response.ok) {

    const text =
      await response.text();

    throw new Error(text);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}


/* -----------------------
   Folders
----------------------- */

async function loadFolders() {

  try {

    const folders =
      await api(
        "folders?select=*&order=created_at.desc"
      );

    foldersGrid.innerHTML = "";

    folderCount.textContent =
      folders.length === 1
        ? "תיקייה אחת"
        : `${folders.length} תיקיות`;

    noFolders.style.display =
      folders.length
        ? "none"
        : "block";


    for (const folder of folders) {

      const files =
        await api(
          `files?select=id&folder_id=eq.${folder.id}`
        );

      const card =
        document.createElement("div");

      card.className =
        "folder-card";

      card.innerHTML = `
        <div class="folder-icon">📁</div>
        <div class="folder-name"></div>
        <div class="folder-files"></div>
      `;

      card.querySelector(
        ".folder-name"
      ).textContent =
        folder.name;

      card.querySelector(
        ".folder-files"
      ).textContent =
        files.length === 1
          ? "קובץ אחד"
          : `${files.length} קבצים`;

      card.onclick =
        () => openFolder(folder);

      foldersGrid.appendChild(card);
    }

  } catch (error) {

    console.error(error);

    alert(
      "לא ניתן לטעון את התיקיות."
    );
  }
}


/* Create folder */

newFolderBtn.onclick = () => {

  folderModal.classList.remove(
    "hidden"
  );

  folderName.value = "";

  setTimeout(
    () => folderName.focus(),
    100
  );
};


closeModal.onclick = () => {

  folderModal.classList.add(
    "hidden"
  );
};


createFolderBtn.onclick =
  async () => {

    const name =
      folderName.value.trim();

    if (!name) {

      alert(
        "כתוב שם לתיקייה."
      );

      return;
    }

    createFolderBtn.disabled = true;

    try {

      await api(
        "folders",
        {
          method: "POST",

          body:
            JSON.stringify({
              name
            })
        }
      );

      folderModal.classList.add(
        "hidden"
      );

      await loadFolders();

    } catch (error) {

      console.error(error);

      alert(
        "לא ניתן ליצור את התיקייה."
      );

    } finally {

      createFolderBtn.disabled = false;
    }
  };


folderName.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {
      createFolderBtn.click();
    }

    if (event.key === "Escape") {
      closeModal.click();
    }
  }
);


/* -----------------------
   Open folder
----------------------- */

async function openFolder(folder) {

  currentFolder = folder;

  foldersPage.classList.add(
    "hidden"
  );

  folderPage.classList.remove(
    "hidden"
  );

  folderTitle.textContent =
    folder.name;

  await loadFiles();
}


backBtn.onclick = () => {

  stopAutoPlay();

  folderPage.classList.add(
    "hidden"
  );

  foldersPage.classList.remove(
    "hidden"
  );

  currentFolder = null;

  loadFolders();
};


/* -----------------------
   Files
----------------------- */

async function loadFiles() {

  try {

    currentFiles =
      await api(
        `files?select=*&folder_id=eq.${currentFolder.id}&order=created_at.asc`
      );

    await renderFiles();

  } catch (error) {

    console.error(error);

    alert(
      "לא ניתן לטעון את הקבצים."
    );
  }
}


async function renderFiles() {

  filesGrid.innerHTML = "";

  fileCount.textContent =
    currentFiles.length === 1
      ? "קובץ אחד"
      : `${currentFiles.length} קבצים`;

  noFiles.style.display =
    currentFiles.length
      ? "none"
      : "block";


  for (
    let index = 0;
    index < currentFiles.length;
    index++
  ) {

    const file =
      currentFiles[index];

    const card =
      document.createElement("div");

    card.className =
      "file-card";

    const img =
      document.createElement("img");

    img.className =
      "file-preview";

    img.alt =
      file.name;

    img.src = "";

    const info =
      document.createElement("div");

    info.className =
      "file-info";

    const name =
      document.createElement("div");

    name.className =
      "file-name";

    name.textContent =
      file.name;

    info.appendChild(name);

    card.appendChild(img);
    card.appendChild(info);

    card.onclick =
      () => openViewer(index);

    filesGrid.appendChild(card);


    /* Signed URL */

    try {

      img.src =
        await createSignedUrl(
          file.storage_path
        );

    } catch (error) {

      console.error(error);

      img.alt =
        "לא ניתן להציג";
    }
  }
}


/* -----------------------
   Signed URL
----------------------- */

async function createSignedUrl(
  path
) {

  const response =
    await fetch(
      `${SUPABASE_URL}/storage/v1/object/sign/${BUCKET}/${path}`,

      {
        method: "POST",

        headers: {
          ...headers,

          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            expiresIn: 3600
          })
      }
    );


  if (!response.ok) {

    throw new Error(
      await response.text()
    );
  }


  const data =
    await response.json();

  return (
    `${SUPABASE_URL}/storage/v1` +
    data.signedURL
  );
}


/* -----------------------
   Upload
----------------------- */

fileInput.addEventListener(
  "change",
  async event => {

    const files =
      [...event.target.files];

    if (!files.length) {
      return;
    }

    await uploadFiles(files);

    fileInput.value = "";
  }
);


async function uploadFiles(files) {

  uploadStatus.textContent =
    "מעלה קבצים...";


  let uploaded = 0;


  for (const file of files) {

    try {

      const path =
        await uploadFile(file);


      await api(
        "files",
        {
          method: "POST",

          body:
            JSON.stringify({

              folder_id:
                currentFolder.id,

              name:
                file.name,

              storage_path:
                path,

              file_size:
                file.size

            })
        }
      );


      uploaded++;

      uploadStatus.textContent =
        `הועלו ${uploaded} מתוך ${files.length}`;


    } catch (error) {

      console.error(error);

      uploadStatus.textContent =
        "שגיאה בהעלאת קובץ.";
    }
  }


  await loadFiles();


  uploadStatus.textContent =
    "ההעלאה הסתיימה בהצלחה.";


  setTimeout(
    () => {
      uploadStatus.textContent = "";
    },
    2500
  );
}


async function uploadFile(file) {

  const safeName =
    file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );


  const path =
    `${currentFolder.id}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;


  const response =
    await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`,

      {
        method: "POST",

        headers: {
          ...headers,

          "Content-Type":
            file.type
        },

        body: file
      }
    );


  if (!response.ok) {

    throw new Error(
      await response.text()
    );
  }


  return path;
}


/* -----------------------
   Viewer
----------------------- */

async function openViewer(index) {

  viewerIndex = index;

  viewer.classList.remove(
    "hidden"
  );

  await showViewerFile();
}


async function showViewerFile() {

  const file =
    currentFiles[viewerIndex];

  if (!file) {
    return;
  }


  viewerName.textContent =
    file.name;

  viewerImage.src = "";


  try {

    viewerImage.src =
      await createSignedUrl(
        file.storage_path
      );

  } catch (error) {

    console.error(error);

    viewerName.textContent =
      "לא ניתן להציג את הקובץ.";
  }
}


function nextFile() {

  if (!currentFiles.length) {
    return;
  }


  viewerIndex =
    (viewerIndex + 1) %
    currentFiles.length;


  showViewerFile();
}


function previousFile() {

  if (!currentFiles.length) {
    return;
  }


  viewerIndex =
    (viewerIndex - 1 +
      currentFiles.length) %
    currentFiles.length;


  showViewerFile();
}


nextBtn.onclick =
  nextFile;

prevBtn.onclick =
  previousFile;


/* -----------------------
   Auto play
----------------------- */

function startAutoPlay() {

  if (autoTimer) {
    return;
  }


  if (
    viewer.classList.contains(
      "hidden"
    )
  ) {

    if (!currentFiles.length) {
      return;
    }

    openViewer(0);
  }


  autoTimer =
    setInterval(
      nextFile,
      4000
    );


  autoBtn.textContent =
    "⏸ עצור";

}


function stopAutoPlay() {

  clearInterval(
    autoTimer
  );

  autoTimer = null;

  autoBtn.textContent =
    "▶ הצגה אוטומטית";
}


autoBtn.onclick = () => {

  if (autoTimer) {
    stopAutoPlay();
  } else {
    startAutoPlay();
  }
};


viewerPlay.onclick =
  startAutoPlay;

viewerPause.onclick =
  stopAutoPlay;


/* -----------------------
   Close viewer
----------------------- */

closeViewer.onclick = () => {

  stopAutoPlay();

  viewer.classList.add(
    "hidden"
  );

  viewerImage.src = "";
};


viewer.addEventListener(
  "click",
  event => {

    if (
      event.target === viewer
    ) {

      closeViewer.click();
    }
  }
);


/* Keyboard */

document.addEventListener(
  "keydown",
  event => {

    if (
      viewer.classList.contains(
        "hidden"
      )
    ) {
      return;
    }


    if (
      event.key === "ArrowLeft"
    ) {
      nextFile();
    }


    if (
      event.key === "ArrowRight"
    ) {
      previousFile();
    }


    if (
      event.key === "Escape"
    ) {
      closeViewer.click();
    }
  }
);


/* Start */

loadFolders();
