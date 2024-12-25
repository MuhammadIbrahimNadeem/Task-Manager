function getHeaders() {
    return {
        'Content-Type': 'application/json'
    };
}

function openModal() {
    document.getElementById('taskModal').classList.remove('hidden');
    document.getElementById('taskModal').classList.add('flex');
}

function closeModal() {
    document.getElementById('taskModal').classList.add('hidden');
    document.getElementById('taskModal').classList.remove('flex');
}

document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const editingTitle = e.target.dataset.editing;
    
    try {
        const url = editingTitle ? `/update-task/${editingTitle}` : '/create-task';
        const method = editingTitle ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: getHeaders(),
            body: JSON.stringify({ title, description })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to process task');
        }
        
        document.getElementById('taskForm').reset();
        delete e.target.dataset.editing;
        closeModal();
        await loadTasks();
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
});

async function loadTasks() {
    try {
        const response = await fetch('/get-tasks', {
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }

        const tasks = await response.json();
        const tasksContainer = document.getElementById('tasksContainer');
        tasksContainer.innerHTML = '';

        if (tasks.length === 0) {
            tasksContainer.innerHTML = `
                <div class="w-full text-center text-zinc-500">
                    No tasks found. Create one to get started!
                </div>
            `;
            return;
        }

        tasks.forEach(task => {
            const taskCard = createTaskCard(task);
            tasksContainer.appendChild(taskCard);
        });
    } catch (error) {
        console.error('Error loading tasks:', error);
        document.getElementById('tasksContainer').innerHTML = `
            <div class="w-full text-center text-red-500">
                Error loading tasks. Please try again.
            </div>
        `;
    }
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'bg-gradient-to-br from-teal-950 to-[#08201D] rounded-2xl shadow-xl p-8 min-w-[350px] border border-teal-900/30 hover:shadow-2xl hover:border-teal-800/40 transition-all duration-300';
    card.innerHTML = `
        <div class="flex justify-between items-start mb-6">
            <h2 class="text-2xl font-semibold text-white">${task.title}</h2>
            <div class="flex gap-3">
                <button onclick="editTask('${task.title}')" class="bg-zinc-800/50 p-2 rounded-lg text-zinc-400 hover:text-teal-400 hover:bg-zinc-800 transition-all duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                </button>
                <button onclick="deleteTask('${task.title}')" class="bg-zinc-800/50 p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-all duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
        <p class="text-zinc-300 leading-relaxed mb-6">${task.description}</p>
        <div class="flex flex-col gap-1">
            <p class="text-zinc-500 text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                </svg>
                Created: ${new Date(task.createdAt).toLocaleDateString()}
            </p>
            ${task.updatedAt !== task.createdAt ? 
                `<p class="text-zinc-500 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                    </svg>
                    Updated: ${new Date(task.updatedAt).toLocaleDateString()}
                </p>` 
                : ''}
        </div>
    `;
    return card;
}

async function deleteTask(title) {
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            const response = await fetch(`/delete-task/${title}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete task');
            }
            
            await loadTasks();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete task');
        }
    }
}

async function editTask(title) {
    try {
        const response = await fetch(`/get-task/${title}`, {
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to load task');
        }
        
        const task = await response.json();
        
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description;
        
        const form = document.getElementById('taskForm');
        form.dataset.editing = title;
        
        openModal();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load task for editing');
    }
}

document.addEventListener('DOMContentLoaded', loadTasks); 