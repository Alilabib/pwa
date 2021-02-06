//  offline data
db.enablePersistence()
.catch(function(err){
    if(err.code == 'failed-precondition'){
        // probably multiple tabs open at once 
        console.log('persistence');
    }else if(err.code == 'unimplemented'){
        //lack of browser support
        console.log('persistence is not available');
    }
});

db.collection('recipes').onSnapshot((snapshot)=>{
    // console.log(snapshot.docChanges());
    snapshot.docChanges().forEach((change)=>{
        // console.log(change, change.doc.data(), change.doc.id);
        if(change.type === 'added'){
            // add the document data to the web page
            renderRecipe(change.doc.data(),change.doc.id);
        }

        if(change.type === ''){
            // remove the document data from the web page
        }


    });
});


const form = document.querySelector('form');
form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const recipe = {
        title : form.title.value,
        ingredients : form.ingredients.value
    };

    db.collection('recipes').add(recipe)
      .catch(err=> console.log(err));
    form.title.value = '';
    form.ingredients.value = '';
});