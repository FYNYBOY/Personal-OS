function updateTime() {
  document.querySelector("#timeElement").innerHTML = new Date().toLocaleString();
}
updateTime();
setInterval(updateTime, 1000);

var biggestIndex = 1;
var selectedIcon = undefined;
var topBar = document.querySelector("#top");

function openWindow(element) {
  element.style.display = "flex";
  bringToTop(element);
}

function closeWindow(element) {
  element.style.display = "none";
}

function bringToTop(element) {
  biggestIndex++;
  element.style.zIndex = biggestIndex;
  topBar.style.zIndex = biggestIndex + 1;
}

function dragElement(element) {
  var initialX = 0, initialY = 0, deltaX = 0, deltaY = 0;
  var handle = document.getElementById(element.id + "header") || element;
  handle.onmousedown = startDragging;

  function startDragging(e) {
    e.preventDefault();
    initialX = e.clientX;
    initialY = e.clientY;
    document.onmouseup = stopDragging;
    document.onmousemove = onDrag;
  }

  function onDrag(e) {
    e.preventDefault();
    deltaX = initialX - e.clientX;
    deltaY = initialY - e.clientY;
    initialX = e.clientX;
    initialY = e.clientY;
    element.style.top = Math.max(40, element.offsetTop - deltaY) + "px";
    element.style.left = (element.offsetLeft - deltaX) + "px";
  }

  function stopDragging() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function selectIcon(element) {
  element.classList.add("selected");
  selectedIcon = element;
}

function deselectIcon(element) {
  if (element) element.classList.remove("selected");
  selectedIcon = undefined;
}

function handleIconTap(icon, windowElement) {
  if (icon.classList.contains("selected")) {
    deselectIcon(icon);
    openWindow(windowElement);
  } else {
    deselectIcon(selectedIcon);
    selectIcon(icon);
  }
}

function initializeWindow(name) {
  var win = document.querySelector("#" + name);
  var closeButton = document.querySelector("#" + name + "close");
  var icon = document.querySelector("#" + name + "Icon");

  dragElement(win);
  win.addEventListener("mousedown", function () {
    bringToTop(win);
    deselectIcon(selectedIcon);
  });
  if (closeButton) closeButton.addEventListener("click", function () { closeWindow(win); });
  if (icon) icon.addEventListener("click", function () { handleIconTap(icon, win); });
}

initializeWindow("welcome");
initializeWindow("notes");
initializeWindow("files");

document.querySelector("#welcomeopen").addEventListener("click", function () {
  openWindow(document.querySelector("#welcome"));
});

var content = [
  {
    title: "Welcome",
    date: "10/29/2026",
    content: `
      <p contenteditable="true">
        Welcome to my <strong>Notes</strong>! This is where I keep my thoughts.
        <br><br>
        As I <del>once said</del> <ins>always say</ins>:
      </p>
      <blockquote style="background:#f9f9f9; padding:16px; border-radius:16px; margin:0;">
        <i>If you have a problem, use a hash map.<br>~ me</i>
      </blockquote>
    `
  },
  {
    title: "Sample Text",
    date: "10/29/2026",
    content: `<p contenteditable="true">Here's some sample text. Click and edit me!</p>`
  }
];

var sidebar = document.querySelector("#sidebar");
var noteContent = document.querySelector("#noteContent");

function setNotesContent(index) {
  noteContent.innerHTML = content[index].content;
  Array.from(sidebar.children).forEach(function (child, i) {
    child.classList.toggle("active", i === index);
  });
}

function addToSideBar(index) {
  var note = content[index];
  var newDiv = document.createElement("div");
  newDiv.innerHTML = `
    <p>${note.title}</p>
    <p class="date">${note.date}</p>
  `;
  newDiv.addEventListener("click", function () { setNotesContent(index); });
  sidebar.appendChild(newDiv);
}

for (var i = 0; i < content.length; i++) {
  addToSideBar(i);
}
setNotesContent(0);

var fileSystem = {
  type: "folder",
  children: {
    home: {
      type: "folder",
      children: {
        fairuz: {
          type: "folder",
          children: {
            Documents: {
              type: "folder",
              children: {
                "about.txt": {
                  type: "file",
                  content: "Name: Fairuz N\nOS: FairuzOS \nI like building things and testing out new ideas :p"
                },
                "goals.txt": {
                  type: "file",
                  content: "1. Finish this OS\n2. Build more websites\n3. Hit the top rank in Marvel Rivals"
                }
              }
            },
            Favorites: {
              type: "folder",
              children: {
                "shows.txt": {
                  type: "file",
                  content: "My Favorite Shows\n\nHouse M.D.\nIt's about a funny old man who happens to be one of the best doctors in the world."
                },
                "games.txt": {
                  type: "file",
                  content: "Marvel Rivals!!"
                }
              }
            },
            "readme.txt": {
              type: "file",
              content: "Welcome to the FairuzOS file system.\nClick a folder to open it, click a file to read it."
            }
          }
        }
      }
    }
  }
};

var currentPath = ["home", "fairuz"];
var filesList = document.querySelector("#filesList");
var filesPath = document.querySelector("#filesPath");
var filePreview = document.querySelector("#filePreview");
var filesUp = document.querySelector("#filesUp");

function getFolder(path) {
  var node = fileSystem;
  for (var i = 0; i < path.length; i++) {
    node = node.children[path[i]];
  }
  return node;
}

function renderFiles() {
  var folder = getFolder(currentPath);
  filesPath.textContent = "/" + currentPath.join("/");
  filesUp.disabled = currentPath.length === 0;
  filesList.innerHTML = "";

  var names = Object.keys(folder.children).sort(function (a, b) {
    var aFolder = folder.children[a].type === "folder";
    var bFolder = folder.children[b].type === "folder";
    if (aFolder !== bFolder) return aFolder ? -1 : 1;
    return a.localeCompare(b);
  });

  names.forEach(function (name) {
    var item = folder.children[name];
    var entry = document.createElement("div");
    entry.className = "file-entry";
    entry.textContent = (item.type === "folder" ? "📁 " : "📄 ") + name;
    entry.addEventListener("click", function () {
      if (item.type === "folder") {
        currentPath.push(name);
        filePreview.textContent = "Select a file to read it.";
        renderFiles();
      } else {
        Array.from(filesList.children).forEach(function (child) {
          child.classList.remove("active");
        });
        entry.classList.add("active");
        filePreview.textContent = item.content;
      }
    });
    filesList.appendChild(entry);
  });
}

filesUp.addEventListener("click", function () {
  if (currentPath.length > 0) {
    currentPath.pop();
    filePreview.textContent = "Select a file to read it.";
    renderFiles();
  }
});

renderFiles();