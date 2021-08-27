const url = {}
url.root = '/'
url.api = `${url.root}api/`;
url.post = `${url.api}post/`;
url.heart = (postId) => `${url.post}${postId}/heart/`;
url.reply = (postId) => `${url.post}${postId}/reply/`;

class Reply {
    constructor(id, fks, foreignRecords) {
        this.id = id;
        this.fks = fks;
        this.foreignRecords = foreignRecords;

        this.delete();
    }
    delete = () => {
        const deleteForm = $(`#reply-${this.id} .delete`);
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
                const replyId = resultData['reply_id'];
                $(`#reply-${replyId}`).remove();
            })
            return false;
        })
    }
}

class Replies {
    constructor(fks) {
        console.log('777')
        this.fks = fks;

        $('#create-reply').append(
            `<form id="create-reply" method="post" action="${url.reply(this.fks['post'])}"></form>`);
        $('#create-reply > form').append(
            `<input type="text" name="message" autofocus>`);
        $('#create-reply > form').append(`<button>返信</button>`);

        this.get();
        this.create();
    }

    add = (reply) => {
        $('#replies').prepend(`<div id="reply-${reply['id']}"  class="reply-container"></div>`);
        $(`#reply-${reply['id']}`).append(
            `<span class="message">${reply['message']}</span>`);
        $(`#reply-${reply['id']}`).append(
            '<div class="bottom-container"></div>');
        $(`#reply-${reply['id']} .bottom-container`).append('<div></div>');
        $(`#reply-${reply['id']} .bottom-container`).append(
            `<span><form class="delete" method="post" action="${url.reply(this.fks['post'])}${reply['id']}/delete/"></form></span>`);
        $(`#reply-${reply['id']} .delete`).append(
            '<button class="material-icons">delete</button>');
        $(`#reply-${reply['id']} .bottom-container`).append(
            `<span class="write-time">${reply['write_time']}</span>`);

        console.log(reply['id'])
        new Reply(reply['id'], this.fks, {});
    }

    get = () => {
        $.ajax({
            url: `${url.post}${this.fks['post']}/reply/`,
            type: 'get',
            timeout: 5000,
          })
          .done((resultData) => {
              const hashData = JSON.parse(resultData);
              const replies = hashData['replies'];
              replies.forEach(reply => {
                  this.add(reply);
              });
          })
    }

    create = () => {
        const createForm = $('#create-reply > form');
        console.log(createForm);
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
                this.add(resultData['reply']);
                createForm.find('input[name=message]').val('');
                createForm.find('input[name=message]').focus();
            })
            return false;
        })
    }
}

class Post {
    constructor(id, fks, foreignRecords) {
        this.id = id;
        this.fks = fks;
        this.foreignRecords = foreignRecords;

        this.delete();
        this.incrementHeart();
    }
    delete = () => {
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

    incrementHeart = () => {
        const heartDom = $(`#post .heart .material-icons`);
        heartDom.click(event => {
            event.preventDefault();

            // Ajax通信を開始
            $.ajax({
                url: `${url.heart(this.id)}increment/`,
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
}

$(document).ready(async () => {
    const postId = $('#container').data('post-id');
    new Post(postId, { replies:  new Replies({'post': postId})}, {});
});