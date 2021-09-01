const url = {}
url.root = '/'
url.api = `${url.root}api/`;
url.post = `${url.api}post/`;
url.heart = (postId) => `${url.post}${postId}/heart/`;
url.reply = (postId) => `${url.post}${postId}/reply/`;

// 1件の返信に関しての管理を行う
class Reply {
    constructor(id, fks) {
        // id
        this.id = id;
        // 外部キー
        this.fks = fks;

        this.delete();
    }

    // 削除ボタンが押されたら、該当する返信を削除する
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

// 返信一覧に関しての管理を行う
class Replies {
    constructor(fks) {
        // 外部キー
        this.fks = fks;

        // 返信作成フォームの表示を作成
        $('#create-reply').append(
            `<form id="create-reply" method="post" action="${url.reply(this.fks['post'])}"></form>`);
        $('#create-reply > form').append(
            `<input type="text" name="message" autofocus>`);
        $('#create-reply > form').append(`<button>返信</button>`);

        this.get();
        this.create();
    }

    // 返信を返信一覧表示に追加
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

    // 1券の投稿に対しての返信一覧を取得
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

    // 返信作成フォームが作成されたら、返信を作成する
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
                // 返信を返信一覧表示に追加
                this.add(resultData['reply']);

                // 返信作成フォームのリセット
                createForm.find('input[name=message]').val('');
                createForm.find('input[name=message]').focus();
            })
            return false;
        })
    }
}

// 1件の投稿に関しての管理を行う
class Post {
    constructor(id, fks) {
        // id
        this.id = id;
        // 外部キー
        this.fks = fks;

        this.delete();
        this.incrementHeart();
    }

    // 削除ボタンが押されたら、該当する投稿を削除する
    delete = () => {
        const deleteForm = $(`#post .delete`);
        deleteForm.submit(event => {
            event.preventDefault();
            const sendData = deleteForm.serializeArray().reduce((acc, cur) => {
                acc[cur.name] = cur.value;
                return acc;
            }, {})

            // 削除するかどうかを尋ねて、はいが押された場合のみ削除処理に移る
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
                // 該当ページの投稿がなくなるため、投稿一覧ページにリダイレクトする
                location.href = '/post/'
            })
            return false;
        })
    }

    // いいねボタンが押されたら、該当する投稿のいいね数を増やす
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
                // いいね数の表示を変更
                const hashData = JSON.parse(resultData);
                $('#post .heart > .count').html(hashData['heart']);
            })
            return false;
        })
    }
}

// 画面読み込み後の処理
$(document).ready(async () => {
    // 投稿は1件のみなので、あらかじめ投稿を特定するためのidを取得する
    const postId = $('#container').data('post-id');
    new Post(postId, { replies:  new Replies({'post': postId})}, {});
});