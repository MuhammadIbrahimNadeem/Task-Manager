document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
 
    
       
    if (email === "test@gmail.com" && password === "12345"	) {
            window.location.href = '/user';
        } 
        
    else {
            alert('Invalid credentials');
        }

}); 