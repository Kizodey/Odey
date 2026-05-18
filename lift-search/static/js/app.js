(() => {
  let currentSessionId = null;

  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");
  const uploadProgress = document.getElementById("upload-progress");
  const progressBar = document.getElementById("progress-bar");
  const progressLabel = document.getElementById("progress-label");
  const uploadResult = document.getElementById("upload-result");
  const uploadSummary = document.getElementById("upload-summary");
  const fileList = document.getElementById("file-list");
  const uploadError = document.getElementById("upload-error");
  const uploadErrorMsg = document.getElementById("upload-error-msg");
  const clearBtn = document.getElementById("clear-session-btn");

  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const searchLoading = document.getElementById("search-loading");
  const searchResults = document.getElementById("search-results");
  const resultsBody = document.getElementById("results-body");
  const searchError = document.getElementById("search-error");
  const searchErrorMsg = document.getElementById("search-error-msg");
  const copyBtn = document.getElementById("copy-btn");
  const chips = document.querySelectorAll(".chip");

  // Drag-and-drop
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
  });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) handleUpload(fileInput.files[0]);
  });

  clearBtn.addEventListener("click", () => {
    if (currentSessionId) {
      fetch(`/session/${currentSessionId}`, { method: "DELETE" }).catch(() => {});
      currentSessionId = null;
    }
    uploadResult.classList.add("hidden");
    uploadError.classList.add("hidden");
    searchBtn.disabled = true;
    fileInput.value = "";
    clearResults();
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      searchInput.value = chip.dataset.query;
      searchInput.dispatchEvent(new Event("input"));
    });
  });

  searchInput.addEventListener("input", () => {
    searchBtn.disabled = !currentSessionId || !searchInput.value.trim();
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !searchBtn.disabled) {
      e.preventDefault();
      doSearch();
    }
  });

  searchBtn.addEventListener("click", doSearch);

  copyBtn.addEventListener("click", () => {
    const text = resultsBody.innerText;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
    });
  });

  function handleUpload(file) {
    if (!file.name.endsWith(".zip")) {
      showUploadError("Please select a ZIP file.");
      return;
    }

    uploadResult.classList.add("hidden");
    uploadError.classList.add("hidden");
    uploadProgress.classList.remove("hidden");
    progressBar.style.width = "0%";
    progressLabel.textContent = "Uploading...";

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload");

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 80);
        progressBar.style.width = pct + "%";
        progressLabel.textContent = `Uploading... ${pct}%`;
      }
    });

    xhr.addEventListener("load", () => {
      progressBar.style.width = "100%";
      progressLabel.textContent = "Processing documents...";

      setTimeout(() => {
        uploadProgress.classList.add("hidden");
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status === 200) {
            currentSessionId = data.session_id;
            uploadSummary.textContent = `${data.document_count} document${data.document_count !== 1 ? "s" : ""} loaded successfully`;
            fileList.innerHTML = data.files
              .map((f) => `<li title="${f}">${truncate(f, 60)}</li>`)
              .join("");
            uploadResult.classList.remove("hidden");
            searchBtn.disabled = !searchInput.value.trim();
          } else {
            showUploadError(data.error || "Upload failed");
          }
        } catch {
          showUploadError("Unexpected server error");
        }
      }, 400);
    });

    xhr.addEventListener("error", () => {
      uploadProgress.classList.add("hidden");
      showUploadError("Network error. Please try again.");
    });

    xhr.send(formData);
  }

  function showUploadError(msg) {
    uploadError.classList.remove("hidden");
    uploadErrorMsg.textContent = msg;
  }

  function clearResults() {
    searchResults.classList.add("hidden");
    searchError.classList.add("hidden");
    resultsBody.innerHTML = "";
  }

  async function doSearch() {
    if (!currentSessionId || !searchInput.value.trim()) return;

    clearResults();
    searchLoading.classList.remove("hidden");
    searchBtn.disabled = true;

    try {
      const res = await fetch("/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: currentSessionId,
          query: searchInput.value.trim(),
        }),
      });

      const data = await res.json();
      searchLoading.classList.add("hidden");

      if (res.ok) {
        resultsBody.innerHTML = marked.parse(data.answer);
        searchResults.classList.remove("hidden");
      } else {
        searchError.classList.remove("hidden");
        searchErrorMsg.textContent = data.error || "Search failed";
      }
    } catch {
      searchLoading.classList.add("hidden");
      searchError.classList.remove("hidden");
      searchErrorMsg.textContent = "Network error. Please try again.";
    } finally {
      searchBtn.disabled = false;
    }
  }

  function truncate(str, max) {
    return str.length > max ? "..." + str.slice(str.length - max + 3) : str;
  }
})();
