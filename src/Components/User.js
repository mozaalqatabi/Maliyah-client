import {useSelector} from 'react-redux';

const User=()=>{
    let uname=useSelector((state)=>state.counter.user.uname);
    let profilepic=useSelector((state)=>state.counter.user.pic);
    let defpic="https://cdn.vectorstock.com/i/500p/97/32/man-silhouette-profile-picture-vector-2139732.jpg";
    return(
        <>
          {
            profilepic?(<img src={profilepic} className='profilepic'/>):     
                (<img src={defpic} className='profilepic'/>) 
          }
            <h3>{uname}</h3>
        </>
    )
}
export default User;