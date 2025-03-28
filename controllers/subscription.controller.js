import Subscription from '../models/subscription.model.js';
import { workflowClient } from '../config/upstash.js';
import { SERVER_URL } from '../config/env.js';

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        'content-type': 'application/json',
      },
      retries: 0,
    })

    res.status(201).json({ success: true, data: { subscription, workflowRunId } });
  } catch (e) {
    next(e);
  }
}


export const getUserSubscriptions = async (req, res, next) => {
  try {
    // Check if the user is the same as the one in the token
    if (req.user.id !== req.params.id) {
      const error = new Error('You are not the owner of this account');
      error.status = 401;
      throw error;
    }

    const subscriptions = await Subscription.find({ user: req.params.id });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
}


export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error('Subscription not found');
      error.status = 404;
      throw error;
    }

    if (subscription.user.toString() !== req.user._id.toString()) {
      const error = new Error('You are not authorized to cancel this subscription');
      error.status = 403;
      throw error;
    }

    await subscription.remove();

    res.status(200).json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (e) {
    next(e);
  }
};


export const getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find();

    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
};


export const getUpcomingRenewals = async (req, res, next) => {
  try {
    const now = new Date();
    const upcomingSubscriptions = await Subscription.find({
      renewalDate: { $gte: now },
    });

    res.status(200).json({ success: true, data: upcomingSubscriptions });
  } catch (e) {
    next(e);
  }
};


export const getSubscriptionDetails = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error('Subscription not found');
      error.status = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: subscription });
  } catch (e) {
    next(e);
  }
};


export const updateSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error('Subscription not found');
      error.status = 404;
      throw error;
    }

    if (subscription.user.toString() !== req.user._id.toString()) {
      const error = new Error('You are not authorized to update this subscription');
      error.status = 403;
      throw error;
    }

    Object.assign(subscription, req.body);
    await subscription.save();

    res.status(200).json({ success: true, data: subscription });
  } catch (e) {
    next(e);
  }
};


export const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found or unauthorized' });
    }

    res.status(200).json({ success: true, message: 'Subscription deleted successfully' });
  } catch (e) {
    next(e);
  }
};

