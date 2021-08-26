const postId = $('#container').data('post-id');

const url = {}
url.root = '/'
url.api = `${url.root}api/`;
url.post = `${url.api}post/`;
url.heart = `${url.post}${postId}/heart/`;
url.reply = `${url.post}${postId}/reply/`;

const deletePost = () => {
    const deleteForm = $(`#post .delete`);
    deleteForm.submit(event => {
        event.preventDefault();
        const sendData = deleteForm.serializeArray().reduce((acc, cur) => {
            acc[cur.name] = cur.value;
            return acc;
        }, {})

        if (!confirm('本当に削除しますか？')) return false;

        // Ajax通信を開始
        $.ajax({
            url: deleteForm.prop('action'),
            type: deleteForm.prop('method'),
            dataType: 'json',
            data: JSON.stringify(sendData),
            timeout: 5000,
        })
        .done(() => {
            location.href = '/post/'
        })
        return false;
    })
}

const incrementHeart = () => {
    const heartDom = $(`#post .heart .material-icons`);
    heartDom.click(event => {
        event.preventDefault();

        // Ajax通信を開始
        $.ajax({
            url: `${url.heart}increment/`,
            type: 'post',
            timeout: 5000,
        })
        .done((resultData) => {
            const hashData = JSON.parse(resultData);
            $('#post .heart > .count').html(hashData['heart']);
        })
        return false;
    })
}

const deleteReply = (replyId) => {
    const deleteForm = $(`#reply-${replyId} .delete`);
    deleteForm.submit(event => {
        event.preventDefault();
        const sendData = deleteForm.serializeArray().reduce((acc, cur) => {
            acc[cur.name] = cur.value;
            return acc;
        }, {})

        if (!confirm('本当に削除しますか？')) return false;

        // Ajax通信を開始
        $.ajax({
            url: deleteForm.prop('action'),
            type: deleteForm.prop('method'),
            dataType: 'json',
            data: JSON.stringify(sendData),
            timeout: 5000,
        })
        .done((resultData) => {
            const reply_id = resultData['reply_id'];
            $(`#reply-${reply_id}`).remove();
        })
        return false;
    })
}

const addReply = (reply) => {
    $('#replies').prepend(`<div id="reply-${reply['id']}"  class="reply-container"></div>`);
    $(`#reply-${reply['id']}`).append(
        `<span class="message">${reply['message']}</span>`);
    $(`#reply-${reply['id']}`).append(
        '<div class="bottom-container"></div>');
    $(`#reply-${reply['id']} .bottom-container`).append('<div></div>');
    $(`#reply-${reply['id']} .bottom-container`).append(
        `<span><form class="delete" method="post" action="${url.reply}${reply['id']}/delete/"></form></span>`);
    $(`#reply-${reply['id']} .delete`).append(
        '<button class="material-icons">delete</button>');
    $(`#reply-${reply['id']} .bottom-container`).append(
        `<span class="write-time">${reply['write_time']}</span>`);

    deleteReply(reply['id']);
}

const getReplies = () => {
    $.ajax({
        url: `${url.post}${postId}/reply/`,
        type: 'get',
        timeout: 5000,
      })
      .done((resultData) => {
          const hashData = JSON.parse(resultData);
          const replies = hashData['replies'];
          replies.forEach(reply => {
              addReply(reply);
          });
      })
}

const init = () => {
    deletePost();
    incrementHeart();
    getReplies();
    $('#create-reply').append(
        `<form id="create-reply" method="post" action="${url.reply}"></form>`);
    $('#create-reply > form').append(
        `<input type="text" name="message" autofocus>`);
    $('#create-reply > form').append(`<button>返信</button>`);
}

const createReply = () => {
    const createForm = $('#create-reply > form');
    createForm.submit(event => {
        event.preventDefault();
        const sendData = createForm.serializeArray().reduce((acc, cur) => {
            acc[cur.name] = cur.value;
            return acc;
        }, {})

        // Ajax通信を開始
        $.ajax({
          url: createForm.prop('action'),
          type: createForm.prop('method'),
          dataType: 'json',
          data: JSON.stringify(sendData),
          timeout: 5000,
        })
        .done((resultData) => {
            addReply(resultData['reply']);
            createForm.find('input[name=message]').val('');
            createForm.find('input[name=message]').focus();
        })
        return false;
    })
}

init();
createReply();