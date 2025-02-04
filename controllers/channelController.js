const List = require('../models/list');
const Channel = require('../models/channel');
const channelValidator = require("../services/validations/channel");

const get = async (req, res) => {
    const username = req.user ? req.user.username : "";
    const channels = await Channel.find({
        owner: username
    });
    console.log(channels);
    res.render("channels", {
        channels,
        username: req.user ? req.user.username : "",
        active: {
            channels: true
        }
    });
};

const add = async (req, res) => {
    const username = req.user ? req.user.username : "";
    const userLists = await List.find({
        owner: username
    });
    console.log(userLists);

    res.render("add_channel", {
        userLists,
        active: {
            channels: true
        }
    });
};

const create = async (req, res) => {
    const {
        body
    } = req;
    try {
        await channelValidator.validate(body, {
            abortEarly: false
        });
        const {
            username
        } = req.user;
        const newestChannel = await Channel.findOne()
            .sort("-channelCode")
            .exec();
        let code = null;

        if (!newestChannel) {
            code = 1000;
        } else {
            code = parseInt(newestChannel.channelCode);
            code += 1;
        }

        const {
            channel_name: name,
            channel_subject: subject,
            lists
        } = body;
        const channel = new Channel({
            name,
            subject,
            lists,
            owner: username,
            channelCode: `${code}`
        });
        const createdChannel = await channel.save();

        res.json({
            code
        });
    } catch (e) {
        res.status(400).json(e);
    }
};

const update = async (req, res) => {
    const {
        username
    } = req.user;
    const {
        id
    } = req.params;
    const channel = await Channel.findOne({
        owner: username,
        _id: id
    });
    const userLists = await List.find({
            owner: username
        })
        .lean()
        .exec();

    userLists.forEach(userList => {
        if (channel.lists.includes(userList._id)) userList.selected = true;
    });

    console.log(userLists);

    res.render("update_channel", {
        channel,
        username,
        userLists,
        active: {
            channels: true
        }
    });
};

const save = async (req, res) => {
    const {
        body
    } = req;
    try {
        await channelValidator.validate(body, {
            abortEarly: false
        });

        const {
            username
        } = req.user;
        const {
            id
        } = req.params;

        const {
            channel_name: name,
            channel_subject: subject,
            lists
        } = body;

        await Channel.findOneAndUpdate({
            _id: id,
            owner: username
        }, {
            $set: {
                name,
                subject,
                lists
            }
        });

        res.json({});
    } catch (e) {
        res.status(400).json(e);
    }
}

const remove = async (req, res) => {
    const username = req.user.username;
    const channelId = req.body.channelId;
    const removed = await Channel.findOneAndRemove({
        owner: username,
        _id: channelId
    });

    if (removed) {
        res.json({});
    } else {
        res.status(400).json({});
    }
};

module.exports = {
    get,
    add,
    create,
    update,
    save,
    remove
};