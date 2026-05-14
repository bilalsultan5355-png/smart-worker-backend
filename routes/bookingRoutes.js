const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getWorkerBookings,
  acceptBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect, customerOnly, workerOnly } = require('../middleware/authMiddleware');

router.post('/',                          protect, customerOnly, createBooking);
router.get('/my',                         protect, customerOnly, getMyBookings);
router.get('/worker',                     protect, workerOnly,   getWorkerBookings);
router.put('/:id/accept',                 protect, workerOnly,   acceptBooking);
router.put('/:id/reject',                 protect, workerOnly,   rejectBooking);
router.put('/:id/complete',               protect, workerOnly,   completeBooking);
router.put('/:id/cancel',                 protect, customerOnly, cancelBooking);

module.exports = router;
