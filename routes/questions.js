const express = require('express');
const Question = require('../models/question');
const Participation = require('../models/participation');
const catchErrors = require('../lib/async-error');

const router = express.Router();

// 동일한 코드가 users.js에도 있습니다. 이것은 나중에 수정합시다.
function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/signin');
  }
}

/* GET questions listing. */
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const term = req.query.term;
  if (term) {
    query = {$or: [
      {title: {'$regex': term, '$options': 'i'}},
      {location: {'$regex': term, '$options': 'i'}},
      {starts: {'$regex': term, '$options': 'i'}},
      {ends: {'$regex': term, '$options': 'i'}},
      {starts_time: {'$regex': term, '$options': 'i'}},
      {ends_time: {'$regex': term, '$options': 'i'}},
      {event_description: {'$regex': term, '$options': 'i'}},
      {organizer_name: {'$regex': term, '$options': 'i'}},
      {organizer_description: {'$regex': term, '$options': 'i'}},
      {price: {'$regex': term, '$options': 'i'}},
      {evnet_type: {'$regex': term, '$options': 'i'}},
      {event_topic: {'$regex': term, '$options': 'i'}},

    ]};
  }
  const questions = await Question.paginate(query, {
    sort: {createdAt: -1},
    populate: 'author',
    page: page, limit: limit
  });
  res.render('questions/index', {questions: questions, term: term});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('questions/new', {question: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  res.render('questions/edit', {question: question});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id).populate('author');
  const participations = await Participation.find({question: question.id}).populate('author');
  question.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???

  await question.save();
  res.render('questions/show', {question: question, participations: participations});
}));

router.put('/:id', catchErrors(async (req, res, next) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    req.flash('danger', 'Not exist question');
    return res.redirect('back');
  }
  question.title = req.body.title;
  question.location = req.body.location;
  question.starts = req.body.starts;
  question.ends = req.body.ends;
  question.starts_time=req.body.starts_time;
  question.ends_time=req.body.ends_time;
  question.event_description = req.body.event_description;
  question.organizer_name = req.body.organizer_name;
  question.organizer_description = req.body.organizer_description;
  question.price=req.body.price;
  question.event_type=req.body.event_type;
  question.event_topic=req.body.event_topic;

  await question.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/questions');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Question.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/questions');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  var question = new Question({
    title: req.body.title,
    author: user._id,
    location: req.body.location,
    starts: req.body.starts,
    ends: req.body.ends,
    starts_time: req.body.starts_time,
    ends_time: req.body.ends_time,
    event_description: req.body.event_description,
    organizer_name: req.body.organizer_name,
    organizer_description: req.body.organizer_description,
    price: req.body.price,
    event_type: req.body.event_type,
    event_topic: req.body.event_topic,

  });
  await question.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/questions');
}));

router.post('/:id/participations', needAuth, catchErrors(async (req, res, next) => {
  const user = req.user;
  const question = await Question.findById(req.params.id);

  if (!question) {
    req.flash('danger', 'Not exist question');
    return res.redirect('back');
  }

  var participation = new Participation({
    author: user._id,
    question: question._id,
    note: req.body.note,
    age: req.body.age,
    name: req.body.name,
    motive: req.body.motive
  });
  await participation.save();
  question.numParticipations++;
  await question.save();

  req.flash('success', 'Successfully registered');
  res.redirect(`/questions/${req.params.id}`);
}));



module.exports = router;
