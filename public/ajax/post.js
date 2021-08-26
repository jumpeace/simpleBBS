const url = {}
url.root = '/'
url.api = `${url.root}api/`;
url.post = `${url.api}post/`;
url.heart = (postId) => `${url.post}${postId}/heart/`;
url.reply = (postId) => `${url.post}${postId}/reply/`;

const deletePost = (postId) => {
    const deleteForm = $(`#post-${postId} .delete`);
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
            // フォーム要素の内容をハッシュ形式に変換
            data: JSON.stringify(sendData),
            timeout: 5000,
        })
        .done((resultData) => {
            const id = resultData['post_id'];
            $(`#post-${id}`).remove();
        })
        return false;
    })
}

const incrementHeart = (postId) => {
    const heartDom = $(`#post-${postId} .heart .material-icons`);
    heartDom.click(event => {
        event.preventDefault();

        // Ajax通信を開始
        $.ajax({
            url: `${url.heart(postId)}increment/`,
            type: 'post',
            timeout: 5000,
        })
        .done((resultData) => {
            const hashData = JSON.parse(resultData);
            $(`#post-${hashData['id']} .heart > .count`).html(hashData['heart']);
        })
        return false;
    })
}

const getReplyNum = async (postId) => {
    let replyNum;
    await $.ajax({
        url: url.reply(postId),
        type: 'get',
        timeout: 5000,
    })
    .done(async (resultData) => {
        const hash = JSON.parse(resultData);
        replyNum = hash['replies'].length;
    })
    return replyNum;
}

const addPost = async (post) => {
    const replyNum = await getReplyNum(post['id']);
    $('#posts').prepend(`<div id="post-${post['id']}"  class="post"></div>`);
    $(`#post-${post['id']}`).append(
        `<span class="message">${post['message']}</span>`);
    $(`#post-${post['id']}`).append(
        '<div class="bottom-container"></div>');
    $(`#post-${post['id']} .bottom-container`).append(
        `<div class="heart"><span class="material-icons">favorite_border</span><span class="count">${post['heart']}</span></div>`);
    $(`#post-${post['id']} .bottom-container`).append(
        `<a class="reply" href="/post/${post['id']}/reply/"><span class="material-icons">reply</span><span class="count">${replyNum}</span></a>`);
    $(`#post-${post['id']} .bottom-container`).append('<div></div>');
    $(`#post-${post['id']} .bottom-container`).append(
        `<span><form class="delete" method="post" action="${url.post}${post['id']}/delete/"></form></span>`);
    $(`#post-${post['id']} .delete`).append(
        '<button class="material-icons">delete</button>');
    $(`#post-${post['id']} .bottom-container`).append(
        `<span class="write-time">${post['write_time']}</span>`);

    deletePost(post['id']);
    incrementHeart(post['id']);
}

const getPosts = async () => {
    await $.ajax({
        url: url.post,
        type: 'get',
        timeout: 5000,
      })
      .done(async (resultData) => {
          const hashData = JSON.parse(resultData);
          const posts = hashData['posts'];
          for(let i = 0; i < posts.length; i++) {
              await addPost(posts[i]);
          }
      })
}

const init = async () => {
    await getPosts();
    $('#create-post').append(
        `<form method="post" action="${url.post}"></form>`);
    $('#create-post > form').append(
        `<input type="text" name="message" autofocus>`);
    $('#create-post > form').append(`<button>投稿</button>`);
}

const createPost = async () => {
    const createForm = $('#create-post > form');
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
            addPost(resultData['post']);
            createForm.find('input[name=message]').val('');
            createForm.find('input[name=message]').focus();
        })
        return false;
    })
}

$(document).ready(async () => {
    await init();
    await createPost();
});
