document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-details').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-details').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  const eskiDivler = document.querySelectorAll('.emailshort');

  if (eskiDivler.length > 0) {
    eskiDivler.forEach(eskidiv => {
      eskidiv.style.display = "none";
    });
    //eskiDivler.style.display = 'none';
    console.log(eskiDivler.length + " adet eski div silindi");
  }

  //load mailbox
  url = `/emails/${mailbox}`;
  fetch(url)
  .then(response => response.json())
  .then(emails => {
      // ... do something else with emails ...
      emails.forEach(element => {
        const div = document.createElement('div');
        div.setAttribute("class", "emailshort");
        div.setAttribute("onclick", `showEmail(${element.id})`);

        if (element.read == true) {
          div.setAttribute("style", "height:50px; display:flex; justify-content:space-between; align-items:center; vertical-align:middle; border: 1px solid gray; margin-bottom:3px; border-left: 10px solid blue; background-color:lightgrey;");
        } else {
          div.setAttribute("style", "height:50px; display:flex; justify-content:space-between; align-items:center; vertical-align:middle; border: 1px solid gray; margin-bottom:3px; border-left: 10px solid red");
        }

        if (mailbox == "inbox" || mailbox == "archive") {
          if(element.read == false) {
            div.innerHTML = `<p style="font-weight:600; font-size:24px; margin-left:15px; margin-bottom:0;"><i class="fa fa-envelope-o" style="font-size:24px"></i> ${element.sender} <span style="font-size:18px; font-weight:400; margin-left:20px; tab-size:2;">${element.subject}</span></p><p class="text-muted" style="margin-right:15px; margin-bottom:0;">${element.timestamp}</p>`
          } else {
            div.innerHTML = `<p style="font-weight:600; font-size:24px; margin-left:15px; margin-bottom:0;"><i class="fa fa-envelope-open-o" style="font-size:24px"></i> ${element.sender} <span style="font-size:18px; font-weight:400; margin-left:20px; tab-size:2;">${element.subject}</span></p><p class="text-muted" style="margin-right:15px; margin-bottom:0;">${element.timestamp}</p>`
          }
        } else if (mailbox == "sent") {
          div.innerHTML = `<p style="font-weight:600; font-size:24px; margin-left:15px; margin-bottom:0;"><i class="fa fa-send-o" style="font-size:24px"></i> ${element.recipients} <span style="font-size:18px; font-weight:400; margin-left:20px;">${element.subject}</span></p><p class="text-muted" style="margin-right:15px; margin-bottom:0;">${element.timestamp}</p>`
        } else {
          div.innerHTML ="Invalid mailbox."
        }

        document.querySelector('#emails-view').append(div);
      });

  });

}

//sending emails on submit
document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('form').onsubmit = function(event) {
    event.preventDefault()

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value,
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        load_mailbox("sent");      
    });

    return false;
  };

});

//getting email details on click on a div in inbox or sent
function showEmail(email_id) {
  getEmailUrl = `/emails/${email_id}`
  fetch(getEmailUrl)
  .then(response => response.json())
  .then(email => {
      // Show compose view and hide other views
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#email-details').style.display = 'block';

      document.querySelector('#details-subject').innerHTML = email.subject;
      document.querySelector('#details-from').innerHTML = "<span style='font-weight:600'>From: </span>" + email.sender;
      document.querySelector('#details-date').innerHTML = email.timestamp;
      document.querySelector('#details-to').innerHTML = "<span style='font-weight:600'>To: </span>" + email.recipients;
      document.querySelector('#details-body').innerHTML = email.body;
      document.querySelector('#details-id').value = email.id;

      if (email.sender == document.querySelector('#loggedInUserEmail').innerHTML) {
          document.querySelector('#emailDetailsBtnGrp').style.display = 'none';
          
      } else {
          document.querySelector('#emailDetailsBtnGrp').style.display = "block";

          if (email.archived == true) {
            document.querySelector('#archiveBtn').value = "Unarchive"
          } else {
            document.querySelector('#archiveBtn').value = "Archive"
          }


          if (email.read == false) {
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  read: true
              })
            })
          }

      }
      
  });
}

async function getEmail(email_id) {
  getEmailUrl = `/emails/${email_id}`
  var comingEmail;

  await fetch(getEmailUrl)
  .then(response => response.json())
  .then(email => { 

    comingEmail = email;

  });

  return Promise.resolve(comingEmail);
}

async function archive() {
  email_id = document.querySelector('#details-id').value;

  await getEmail(email_id).then(
    async function(value) { 
      if (value.archived == false) {
        await fetch(`/emails/${value.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: true
          })
        }).then(console.log("arşivlendi"));
        
      } else {
        await fetch(`/emails/${value.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: false
          })
        }).then(console.log("arşivden çıktı"));
        
      }
    }
  );

  load_mailbox('inbox');

}

async function reply() {
  email_id = document.querySelector('#details-id').value;

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-details').style.display = 'none';

  email = await getEmail(email_id).then(
    function(value) {
      if (value.subject.substring(0,3) == "Re:") {
        document.querySelector('#compose-subject').value = value.subject;
      } else {
        document.querySelector('#compose-subject').value = "Re: " + value.subject;
      }
    
      // Clear out composition fields
      document.querySelector('#compose-recipients').value = value.sender;
      
      document.querySelector('#compose-body').value = "On " + value.timestamp + " " + value.sender + " wrote: " + value.body;
    }
  )

}

  
  


