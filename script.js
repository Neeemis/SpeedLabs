document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('form-container');
    const mindmapContainer = document.getElementById('mindmap-container');
    const exportBtn = document.getElementById('export-btn');

    let nodeIdCounter = 100; // start high to avoid collision with initial state

    // Initial state matching user's requested template
    let appState = {
        id: 'root',
        text: 'Central Idea',
        level: 0,
        children: [
            {
                id: 'node-1',
                text: 'Main Branch 1',
                level: 1,
                children: [
                    {
                        id: 'node-1-1',
                        text: 'Sub-Branch 1.1',
                        level: 2,
                        children: [
                            { id: 'node-1-1-1', text: 'Detail / Action Item', level: 3, children: [] },
                            { id: 'node-1-1-2', text: 'Detail / Action Item', level: 3, children: [] }
                        ]
                    },
                    {
                        id: 'node-1-2',
                        text: 'Sub-Branch 1.2',
                        level: 2,
                        children: [
                            { id: 'node-1-2-1', text: 'Detail / Action Item', level: 3, children: [] }
                        ]
                    }
                ]
            },
            {
                id: 'node-2',
                text: 'Main Branch 2',
                level: 1,
                children: [
                    {
                        id: 'node-2-1',
                        text: 'Sub-Branch 2.1',
                        level: 2,
                        children: [
                            { id: 'node-2-1-1', text: 'Detail / Action Item', level: 3, children: [] }
                        ]
                    },
                    {
                        id: 'node-2-2',
                        text: 'Sub-Branch 2.2',
                        level: 2,
                        children: [
                            { id: 'node-2-2-1', text: 'Detail / Action Item', level: 3, children: [] },
                            { id: 'node-2-2-2', text: 'Detail / Action Item', level: 3, children: [] }
                        ]
                    }
                ]
            },
            {
                id: 'node-3',
                text: 'Main Branch 3',
                level: 1,
                children: [
                    {
                        id: 'node-3-1',
                        text: 'Sub-Branch 3.1',
                        level: 2,
                        children: [
                            { id: 'node-3-1-1', text: 'Detail / Action Item', level: 3, children: [] }
                        ]
                    },
                    {
                        id: 'node-3-2',
                        text: 'Sub-Branch 3.2',
                        level: 2,
                        children: [
                            { id: 'node-3-2-1', text: 'Detail / Action Item', level: 3, children: [] }
                        ]
                    }
                ]
            }
        ]
    };

    function generateId() {
        return 'node-' + (nodeIdCounter++);
    }

    function findNodeAndParent(node, id, parent = null) {
        if (node.id === id) {
            return { node, parent };
        }
        for (let child of node.children) {
            const result = findNodeAndParent(child, id, node);
            if (result) return result;
        }
        return null;
    }

    function getLevelName(level) {
        if (level === 0) return 'Main Branch';
        if (level === 1) return 'Sub-Branch';
        return 'Detail';
    }

    // --- FORM RENDERING ---

    function createFormNode(node) {
        const wrapper = document.createElement('div');
        wrapper.className = 'node-wrapper';

        const nodeDiv = document.createElement('div');
        nodeDiv.className = `form-node-card level-${node.level}`;
        
        const inputGroup = document.createElement('div');
        inputGroup.className = 'form-input-group';
        
        const input = document.createElement('textarea');
        input.className = 'gf-input';
        input.value = node.text;
        input.rows = 1;
        input.placeholder = (node.level === 0 ? 'Central Idea' : getLevelName(node.level - 1)) + '...';
        
        // Auto-resize initial height
        setTimeout(() => {
            input.style.height = 'auto';
            input.style.height = input.scrollHeight + 'px';
        }, 0);

        // Update state, auto-resize, and mindmap on typing
        input.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
            node.text = e.target.value;
            renderMindMap();
        });

        inputGroup.appendChild(input);

        // Delete button (except for root)
        if (node.level > 0) {
            const delBtn = document.createElement('button');
            delBtn.className = 'icon-btn';
            delBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>';
            delBtn.addEventListener('click', () => {
                const result = findNodeAndParent(appState, node.id);
                if (result && result.parent) {
                    result.parent.children = result.parent.children.filter(c => c.id !== node.id);
                    renderForm();
                    renderMindMap();
                }
            });
            inputGroup.appendChild(delBtn);
        }

        nodeDiv.appendChild(inputGroup);
        wrapper.appendChild(nodeDiv); // Add card to wrapper

        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'children-container';

        // Render children
        if (node.children) {
            node.children.forEach(child => {
                childrenContainer.appendChild(createFormNode(child));
            });
        }

        // Add Child button
        const addBtn = document.createElement('button');
        addBtn.className = 'gf-add-btn';
        addBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg> Add ${getLevelName(node.level)}`;
        addBtn.addEventListener('click', () => {
            node.children.push({
                id: generateId(),
                text: getLevelName(node.level) + ' (New)',
                level: node.level + 1,
                children: []
            });
            // Re-render both to show new input and node
            renderForm();
            renderMindMap();
            
            // Focus the new input
            setTimeout(() => {
                const inputs = childrenContainer.querySelectorAll('.gf-input');
                if (inputs.length > 0) {
                    inputs[inputs.length - 1].focus();
                    inputs[inputs.length - 1].select();
                }
            }, 50);
        });
        
        childrenContainer.appendChild(addBtn);
        wrapper.appendChild(childrenContainer); // Add children to wrapper, below card

        return wrapper;
    }

    function renderForm() {
        formContainer.innerHTML = '';
        formContainer.appendChild(createFormNode(appState));
    }


    // --- MIND MAP RENDERING ---

    function assignThemeColors(node) {
        let colorCounter = 0;
        if (node.children) {
            node.children.forEach(child => {
                // If it's a level 1 child, assign a distinct color cycle
                if (child.level === 1) {
                    child.themeColorIndex = colorCounter % 5;
                    colorCounter++;
                } else {
                    // Inherit color from parent for deeper levels
                    child.themeColorIndex = node.themeColorIndex;
                }
                assignThemeColors(child);
            });
        }
    }

    function renderMindMapNode(node) {
        const styledLevel = Math.min(node.level, 3);
        const colorClass = node.level > 0 && node.themeColorIndex !== undefined ? `color-${node.themeColorIndex}` : '';
        
        let html = `<li><div class="node-content node-level-${styledLevel} ${colorClass}">${escapeHtml(node.text)}</div>`;
        
        if (node.children && node.children.length > 0) {
            html += `<ul>`;
            for (let child of node.children) {
                html += renderMindMapNode(child);
            }
            html += `</ul>`;
        }
        
        html += `</li>`;
        return html;
    }

    function renderMindMap() {
        // Pre-process to assign colors dynamically based on current tree structure
        assignThemeColors(appState);

        let html = `<div class="mindmap"><ul>`;
        html += renderMindMapNode(appState);
        html += `</ul></div>`;
        
        mindmapContainer.innerHTML = html;
    }

    // Utility to prevent XSS
    function escapeHtml(unsafe) {
        return (unsafe || "")
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }


    // --- EXPORT LOGIC ---

    exportBtn.addEventListener('click', () => {
        const originalText = exportBtn.innerHTML;
        exportBtn.innerHTML = 'Exporting...';
        exportBtn.disabled = true;

        const node = document.getElementById('mindmap-container');
        node.classList.add('exporting');
        
        domtoimage.toSvg(node, { 
            quality: 1.0,
            style: { background: 'transparent' }
        })
        .then(function (dataUrl) {
            const link = document.createElement('a');
            link.download = 'mindmap.svg';
            link.href = dataUrl;
            link.click();
            
            node.classList.remove('exporting');
            exportBtn.innerHTML = originalText;
            exportBtn.disabled = false;
        })
        .catch(function (error) {
            console.error('Oops, something went wrong!', error);
            alert('Failed to export image. Please try again.');
            
            node.classList.remove('exporting');
            exportBtn.innerHTML = originalText;
            exportBtn.disabled = false;
        });
    });


    // --- AI INTEGRATION LOGIC ---

    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeModal = document.getElementById('close-modal');
    const saveSettings = document.getElementById('save-settings');
    const apiKeyInput = document.getElementById('api-key-input');
    const modelSelect = document.getElementById('model-select');
    
    const dropZone = document.getElementById('drop-zone');
    const aiFileInput = document.getElementById('ai-file-input');
    const loadingOverlay = document.getElementById('loading-overlay');

    const aiTopicInput = document.getElementById('ai-topic-input');
    const aiClassSelect = document.getElementById('ai-class-select');
    const aiGenerateTopicBtn = document.getElementById('ai-generate-topic-btn');

    const tabManual = document.getElementById('tab-manual');
    const tabAi = document.getElementById('tab-ai');
    const manualToolsContainer = document.getElementById('manual-tools-container');
    const aiToolsContainer = document.getElementById('ai-tools-container');

    const sidebar = document.querySelector('.sidebar');
    const collapseSidebarBtn = document.getElementById('collapse-sidebar-btn');
    const showSidebarBtn = document.getElementById('show-sidebar-btn');

    // Sidebar Collapse Logic
    if (collapseSidebarBtn && showSidebarBtn) {
        collapseSidebarBtn.addEventListener('click', () => {
            sidebar.classList.add('collapsed');
            showSidebarBtn.style.display = 'block';
        });

        showSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('collapsed');
            showSidebarBtn.style.display = 'none';
        });
    }

    // Tab Switching Logic
    tabManual.addEventListener('click', () => {
        tabManual.classList.add('active');
        tabAi.classList.remove('active');
        manualToolsContainer.style.display = 'block';
        aiToolsContainer.style.display = 'none';
    });

    tabAi.addEventListener('click', () => {
        tabAi.classList.add('active');
        tabManual.classList.remove('active');
        aiToolsContainer.style.display = 'block';
        manualToolsContainer.style.display = 'none';
    });

    // Load API Key and Model
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) apiKeyInput.value = savedKey;
    
    const savedModel = localStorage.getItem('gemini_api_model') || 'gemini-2.5-flash';
    modelSelect.value = savedModel;

    settingsBtn.addEventListener('click', () => settingsModal.style.display = 'flex');
    closeModal.addEventListener('click', () => settingsModal.style.display = 'none');
    
    saveSettings.addEventListener('click', () => {
        localStorage.setItem('gemini_api_key', apiKeyInput.value.trim());
        localStorage.setItem('gemini_api_model', modelSelect.value);
        settingsModal.style.display = 'none';
    });

    const testKeyBtn = document.getElementById('test-key-btn');
    if (testKeyBtn) {
        testKeyBtn.addEventListener('click', async () => {
            const key = apiKeyInput.value.trim();
            if (!key) {
                alert("Please enter a key to test first.");
                return;
            }
            testKeyBtn.innerHTML = 'Testing...';
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
                const data = await response.json();
                if (data.error) {
                    alert(`API Error: ${data.error.message}`);
                } else if (data.models) {
                    const modelNames = data.models.map(m => m.name.replace('models/', '')).join(', ');
                    alert(`Success! Your key is valid.\n\nAvailable models:\n${modelNames}`);
                } else {
                    alert("Unknown response from API.");
                }
            } catch (err) {
                alert(`Network error: ${err.message}`);
            } finally {
                testKeyBtn.innerHTML = 'Test Key';
            }
        });
    }

    // Generate by Topic & Class
    aiGenerateTopicBtn.addEventListener('click', async () => {
        const key = localStorage.getItem('gemini_api_key');
        const model = localStorage.getItem('gemini_api_model') || 'gemini-2.5-flash';
        const topic = aiTopicInput.value.trim();
        const academicClass = aiClassSelect.value;
        
        if (!key) {
            settingsModal.style.display = 'flex';
            alert("Please enter your Gemini API key first.");
            return;
        }
        if (!topic) {
            alert("Please enter a topic to generate.");
            return;
        }

        loadingOverlay.style.display = 'flex';
        
        if (window.innerWidth <= 768 && collapseSidebarBtn) {
            sidebar.classList.add('collapsed');
            showSidebarBtn.style.display = 'flex';
        }
        
        try {
            const prompt = `You are an expert tutor. Create a detailed mind map for the topic '${topic}' specifically tailored for a student in '${academicClass}'.
Search the web for the latest syllabus or standard curriculum for this specific class level if needed. Ensure the depth, concepts, and formulas included match this academic level exactly.
You MUST return ONLY a raw valid JSON object exactly matching this format: 
{ "id": "root", "text": "Central Topic", "level": 0, "children": [ { "id": "node-x", "text": "Sub topic", "level": 1, "children": [] } ] }.
Ensure all levels are correctly numbered (0 for root, 1 for main branches, 2 for sub-branches, etc). DO NOT return markdown formatting (no \`\`\`json).`;

            const aiPayload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "tools": [{"googleSearch": {}}] // Enable Web Search Grounding
            };

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aiPayload)
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);

            let rawJsonStr = data.candidates[0].content.parts[0].text.trim();
            if (rawJsonStr.startsWith('```')) {
                rawJsonStr = rawJsonStr.replace(/^```(json)?/, '').replace(/```$/, '').trim();
            }

            const newTree = JSON.parse(rawJsonStr);
            
            function sanitizeTree(node, level = 0) {
                node.id = generateId();
                node.level = level;
                if (!node.children) node.children = [];
                node.children.forEach(child => sanitizeTree(child, level + 1));
            }
            sanitizeTree(newTree);

            appState = newTree;
            renderForm();
            renderMindMap();

        } catch (err) {
            console.error(err);
            alert("Error generating mind map: " + err.message);
        } finally {
            loadingOverlay.style.display = 'none';
        }
    });

    // Drag and drop UI logic
    dropZone.addEventListener('click', () => {
        const key = localStorage.getItem('gemini_api_key');
        if (!key) {
            settingsModal.style.display = 'flex';
            alert("Please enter your Gemini API key first.");
            return;
        }
        aiFileInput.click();
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        const key = localStorage.getItem('gemini_api_key');
        const model = localStorage.getItem('gemini_api_model') || 'gemini-2.5-flash';
        if (!key) {
            settingsModal.style.display = 'flex';
            alert("Please enter your Gemini API key first.");
            return;
        }

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleAiFile(e.dataTransfer.files[0], key, model);
        }
    });

    aiFileInput.addEventListener('change', (e) => {
        const key = localStorage.getItem('gemini_api_key');
        const model = localStorage.getItem('gemini_api_model') || 'gemini-2.5-flash';
        if (e.target.files && e.target.files.length > 0) {
            handleAiFile(e.target.files[0], key, model);
        }
    });

    // Support pasting images directly from the clipboard
    document.addEventListener('paste', (e) => {
        const key = localStorage.getItem('gemini_api_key');
        const model = localStorage.getItem('gemini_api_model') || 'gemini-2.5-flash';
        
        if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
            const file = e.clipboardData.files[0];
            if (file.type.startsWith('image/')) {
                if (!key) {
                    settingsModal.style.display = 'flex';
                    alert("Please enter your Gemini API key first.");
                    return;
                }
                e.preventDefault();
                handleAiFile(file, key, model);
            }
        }
    });

    async function handleAiFile(file, key, model) {
        if (!file) return;
        loadingOverlay.style.display = 'flex';
        
        if (window.innerWidth <= 768 && collapseSidebarBtn) {
            sidebar.classList.add('collapsed');
            showSidebarBtn.style.display = 'flex';
        }

        try {
            let aiPayload = {};

            if (file.type === 'application/pdf') {
                // Parse PDF
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                let fullText = "";
                for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) { // Limit to 10 pages
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + "\n";
                }
                aiPayload = {
                    "contents": [{
                        "parts": [{"text": "Extract a hierarchical mind map structure from the following text. You MUST return ONLY a raw valid JSON object exactly matching this format: { \"id\": \"root\", \"text\": \"Main Topic\", \"level\": 0, \"children\": [ { \"id\": \"node-x\", \"text\": \"Sub topic\", \"level\": 1, \"children\": [] } ] }. Ensure all levels are correctly numbered (0 for root, 1 for main branches, 2 for sub-branches, etc). DO NOT return markdown formatting (no ```json). Here is the text:\n\n" + fullText}]
                    }]
                };
            } else if (file.type.startsWith('image/')) {
                // Parse Image
                const base64Data = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result.split(',')[1]);
                    reader.readAsDataURL(file);
                });
                aiPayload = {
                    "contents": [{
                        "parts": [
                            {"text": "Extract a hierarchical mind map structure from this image. You MUST return ONLY a raw valid JSON object exactly matching this format: { \"id\": \"root\", \"text\": \"Main Topic\", \"level\": 0, \"children\": [ { \"id\": \"node-x\", \"text\": \"Sub topic\", \"level\": 1, \"children\": [] } ] }. Ensure all levels are correctly numbered (0 for root, 1 for main branches, 2 for sub-branches, etc). DO NOT return markdown formatting (no ```json)."},
                            {"inline_data": {"mime_type": file.type, "data": base64Data}}
                        ]
                    }]
                };
            } else {
                throw new Error("Unsupported file type. Please upload a PDF or Image.");
            }

            // Call Gemini API dynamically using the selected model
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aiPayload)
            });

            const data = await response.json();
            
            if (data.error) throw new Error(data.error.message);

            let rawJsonStr = data.candidates[0].content.parts[0].text.trim();
            if (rawJsonStr.startsWith('```')) {
                rawJsonStr = rawJsonStr.replace(/^```(json)?/, '').replace(/```$/, '').trim();
            }

            const newTree = JSON.parse(rawJsonStr);
            
            // Re-assign IDs
            function sanitizeTree(node, level = 0) {
                node.id = generateId();
                node.level = level;
                if (!node.children) node.children = [];
                node.children.forEach(child => sanitizeTree(child, level + 1));
            }
            sanitizeTree(newTree);

            // Update app state
            appState = newTree;
            renderForm();
            renderMindMap();

        } catch (err) {
            console.error(err);
            alert("Error processing document: " + err.message);
        } finally {
            loadingOverlay.style.display = 'none';
            aiFileInput.value = ''; // Reset input
        }
    }

    if (window.innerWidth <= 768 && collapseSidebarBtn) {
        sidebar.classList.add('collapsed');
        showSidebarBtn.style.display = 'flex';
    }

    // Mobile Swipe Gestures
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        if (window.innerWidth <= 768) {
            const distance = touchEndX - touchStartX;
            // Swipe right from left edge to open
            if (distance > 50 && touchStartX < 50) {
                sidebar.classList.remove('collapsed');
                showSidebarBtn.style.display = 'none';
            }
            // Swipe left to close
            if (distance < -50) {
                sidebar.classList.add('collapsed');
                showSidebarBtn.style.display = 'flex';
            }
        }
    }, {passive: true});

    // Initial render
    renderForm();
    renderMindMap();
});
