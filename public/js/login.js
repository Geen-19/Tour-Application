


const login =  async (email, password) => {
    console.log(email,password)
    try{
        
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email,
                password
            }       
    
        });
        console.log(res)
    }catch (err){
        console.log(err.response.data);
    }
    
}
document.querySelector('.btn').addEventListener('click', e => {
    console.log('Hello From Login')
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    login(email,password)
})