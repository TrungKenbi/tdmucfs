var count=0;
function display(){
    count++;
    var x=document.getElementById('menu-show');
    x.style.visibility='visible';
    x.style.animation= 'scale-in 0.5s';
    if(count==2){
        x.style.visibility='hidden';
        x.style.animation= 'scale-out 0.5s';
        count=0;
    }
}