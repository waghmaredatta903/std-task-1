const cl = console.log;

const stdForm = document.getElementById('stdForm');
const stdList = document.getElementById('stdList');
const addBtn = document.getElementById('addBtn');
const updateBtn = document.getElementById('updateBtn');
const spinner = document.getElementById("spinner")

const BASE_URL = `https://crud-b22-e9992-default-rtdb.asia-southeast1.firebasedatabase.app`
const STUDENT_URL = `${BASE_URL}/students.json`

const state = {
    studentArr: [],
    editStudent_ID: null
}
function snackBar(text, msg, icon) {
    Swal.fire({
        text: text,
        title: msg,
        icon: icon,
        timer: 3000
    })
}
function handleSpinner(flag){
    if(flag){
        spinner.classList.remove("d-none");
    }else{
        spinner.classList.add("d-none");
    }
}

function stdObjFun(obj) {
    state.studentArr = []

    for (const key in obj) {
        obj[key].id = key;
        state.studentArr.unshift(obj[key])
    }
}

function rendersFun(arr) {
    let result = ``;
    arr.forEach((ele, i) => {
        result += `<tr id="${ele.id}">
                   <td>${i + 1}</td>
                   <td>${ele.fname}</td>
                   <td>${ele.lname}</td>
                   <td>${ele.contact}</td>
                    <td>${ele.email}</td>
                    <td>
                    <i
                        onclick="onEditStd(this)"
                        class="fa-solid fa-pen-to-square fa-2x text-primary action-icon"
                        title="Edit">
                    </i>
                </td>
                <td>
                    <i
                        onclick="onRemoveStd(this)"
                        class="fa-solid fa-trash-can fa-2x text-danger action-icon"
                        title="Remove">
                    </i>
                </td>
            </tr>`
    })

    stdList.innerHTML = result;
}

function addfetchStd() {
    // handleSpinner(true)

    fetch(STUDENT_URL)
        .then(res => {
            if (!res.ok) {
                throw new Error("Error....")
            }
            return res.json()
        })
        .then(obj => {
            stdObjFun(obj);
            rendersFun(state.studentArr)
        })
        .catch(err => {
            snackBar(err)
        })
        .finally(() => {
            // handleSpinner(false)
        })
}
addfetchStd()

function createStd(eve) {
    eve.preventDefault();
    handleSpinner(true);

    let NewStd_OBJ = {
        fname: fname.value,
        lname: lname.value,
        contact: contact.value,
        email: email.value
    };
    fetch(STUDENT_URL, {
        method: "POST",
        body: JSON.stringify(NewStd_OBJ),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Failed to create student");
            }
            return res.json();
        })
        .then(res => {
            NewStd_OBJ.id = res.name;
            state.studentArr.unshift(NewStd_OBJ);

            stdForm.reset();
            rendersFun(state.studentArr);
            snackBar("CREATED!!",`Student added successfully!!!`, 'success')
        })
        .catch(err => {
            snackBar(err)
        })
        .finally(() => {
             handleSpinner(false);
        });
}


function onEditStd(ele) {
    let EDIT_ID = ele.closest('tr').id;
    // cl(EDIT_ID)
    state.editStudent_ID = EDIT_ID;

    let EDIT_URL = `${BASE_URL}/students/${EDIT_ID}.json`;
    // cl(EDIT_URL)
    handleSpinner(true)
    fetch(EDIT_URL, {
        method: "GET",
        headers: {
            "Content-type": "application/json",
            "Authorization": "JWT Token from LS"
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Error fetching student data");
            }
            return res.json();
        })
        .then(res => {
            cl(res)
            let NewEditobj = {
                fname: res.fname || "",
                lname: res.lname || "",
                contact: res.contact || "",
                email: res.email || ""
            };
            fname.value = NewEditobj.fname;
            lname.value = NewEditobj.lname;
            contact.value = NewEditobj.contact;
            email.value = NewEditobj.email;

            addBtn.classList.add("d-none");
            updateBtn.classList.remove("d-none");
        })
        .catch(err => {
            snackBar(err.message);
        })
        .finally(() => {
         handleSpinner(false)
        });
}

function onUpdateStd(eve) {
    eve.preventDefault();

    let UPDATE_ID = state.editStudent_ID;
    let UPDATE_URL = `${BASE_URL}/students/${UPDATE_ID}.json`;

    let UPDATE_OBJ = {
        fname: fname.value,
        lname: lname.value,
        contact: contact.value,
        email: email.value
    };
    handleSpinner(true)
    fetch(UPDATE_URL, {
        method: "PATCH",
        body: JSON.stringify(UPDATE_OBJ),
        headers: {
            "Content-type": "application/json",
            "Authorization": "JWT Token from LS"
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error("Error updating student");
        }
        return res.json();
    })
    .then(res => {
       let getIndex = state.studentArr.findIndex(s => s.id === UPDATE_ID);
       state.studentArr[getIndex] = UPDATE_OBJ;
        rendersFun(state.studentArr);
        stdForm.reset();
        state.editStudent_ID = null;
        snackBar("UPDATED!!", `Student with id ${UPDATE_ID} is Updated Successfully`, 'success')


        addBtn.classList.remove("d-none");
        updateBtn.classList.add("d-none");
    })
    .catch(err => {
        snackBar(err.message);
    })
    .finally(()=>{
        handleSpinner(false)
    })

}

function onRemoveStd(ele) {
    let DELETE_ID = ele.closest('tr').id;
    let DELETE_URL = `${BASE_URL}/students/${DELETE_ID}.json`;

    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e0462b",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            handleSpinner(true)
            fetch(DELETE_URL, {
                method: "DELETE",
                headers: {
                    "Content-type": "application/json",
                    "Authorization": "JWT Token from LS"
                }
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error("Error deleting student");
                }
                return res.json()
            })
            .then(res =>{
                state.studentArr = state.studentArr.filter(s => s.id !== DELETE_ID);
                rendersFun(state.studentArr);
              snackBar("DELETED!!!", `Student with id ${DELETE_ID} is Deleted Successfully`, 'success')
            })
            .catch(err => {
             snackBar(err)
            })
            .finally(()=>{
                handleSpinner(false)
            })
        }
    });
}

stdForm.addEventListener("submit", createStd);
updateBtn.addEventListener("click", onUpdateStd);