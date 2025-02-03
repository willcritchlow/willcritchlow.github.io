---
layout: post
title: "How to debug things. A guide for non-developers"
date: 2016-01-08 16:17:54 +0000
categories: how-to
---

![Maybe it is cosmic rays (image source: nasamarshall)](/assets/images/1_PrtekvLGAXTzodX513D04Q.webp)

The more mechanical and physical something is, the more it tends to be obvious why something isn’t working. It may place you no closer to _fixing_ it, but if you have a flat tire, you know why your car isn’t driving how you want. If your window is broken, you know why there’s a draft.

As [software eats the world](http://breakingsmart.com/season-1/), however, it can be increasingly challenging to work out _why something is broken_ — never mind trying to fix it.

Developers are taught to debug. I decided to write this up because I think that debugging is fast becoming a core life-skill. Whether you _write_ software or not, you need to improve your mental model for how it works, why things are going wrong, and how to specify the fixes you need. I believe that the skills developed learning to debug software make you better at debugging stuff powered by computers even if you don’t have access to the code.

This post grew out of an internal note I started writing for our team at [Distilled](https://www.distilled.net) where we have a bunch of technical consultants who aren’t necessarily engineers by training. Where some organisations are sales-led, and some are engineering-led, we are consulting-led (even our [core values](https://www.distilled.net/manifesto) embed key consulting skills like communication and effecting change). As the team grows, debugging skills are one of those things we need to teach. It ended up being more generally-applicable so I thought I’d publish it here.

For reference, when you come back to this post, here’s the checklist to use when you’re trying to figure out why something isn’t working the way you want it to:

1.  Can you reproduce it?
2.  Can you describe it?
3.  Can you expose its internal state?
4.  Can you isolate it? (Have you found the impossible part?)
5.  Have you explained the problem to someone else?
6.  Have you slept on it?

Can you reproduce it?
---------------------

While there are times when something goes wrong and you definitely [don’t want to do it again](http://www.redbull.com/uk/en/bike/stories/1331584675965/danny-macaskill-secret-file-trial-bike-outtakes-video), the key for most system failures is to figure out what conditions cause the failure to happen. For “safe” failures, that can literally mean repeating the events leading up to the failure with small variations until you find out a sequence of events that always causes it. For failures that have irreversible consequences, it is either about finding a safe sandbox where you can observe the failure repeatedly without suffering the consequences or it’s about attempting to document everything that happened in the lead-up to the failure no matter how trivial-seeming. By definition, when you are trying to debug a failure, you don’t know the cause, and the only real way of telling that [it’s not lupus](http://knowyourmeme.com/memes/its-not-lupus) is to find the sometimes-seemingly-trivial issue that caused the failure.

Reproducing a failure is all about challenging your assumptions — does it really happen _every_ time you do X, or only when you have previously done Y? Your goal here is to find **necessary _and_ sufficient** conditions — and the easiest way to tell when you have achieved it is that you can write a simple bullet-pointed list that someone else can follow to observe the same failure. This brings us onto the second point:

Can you describe it?
--------------------

You can tell that you can reproduce a failure effectively when you can describe a sequence of steps someone else can take to observe the same failure. In addition, there are a few other key pieces of information that should go into describing the failure. The most important are:

1.  What you expected to happen
2.  What did happen and how it was different

The first of these exposes problems with your mental model, and also helps others give you advice on “fixing” the problem so that your expected outcome actually happens.

The second is perhaps even more critical — in accurately describing a problem, you can often find yourself sketching out a solution inadvertently. This is a form of [rubber duck debugging](http://www.rubberduckdebugging.com/).

Can you expose its internal state?
----------------------------------

There are times when we have to debug a black box, but in general it’s way easier if you can take the lid off. Remember that there are debugging tools for most environments that specifically make this easier — and it _will_ be worth your time to learn them instead of just sticking “print” statements all over the place — but sometimes you have to work with packaged software, software as a service, or complex systems. In those cases, watch out for:

*   any way of generating log files — from the system itself or the operating system within which it runs
*   advanced features for power users that expose more of what’s going on
*   third party tools that burrow under the surface (e.g. I recently found this [android app](https://play.google.com/store/apps/details?id=com.farproc.wifi.analyzer&hl=en) when trying to figure out why devices were dropping off my home wifi connection)

Can you isolate it?
-------------------

Simpler systems are easier to debug than more complex ones. It is often highly effective to build yourself the simplest system that exhibits the broken behaviour you’ve been seeing. Separate the system into parts, swap out pieces to figure out which bits are broken. If you’re actually writing code, [use a debugger](http://blog.codinghorror.com/the-first-rule-of-programming-its-always-your-fault/)(!).

The real-world example of this is when a desk lamp stops working. You can:

*   try a different bulb in that lamp / try the bulb in a different lamp
*   try that lamp in a different plug socket / try a different device in that socket

The key part here is then to realise that differences in outcome point to root causes. If the lamp works in a different socket, the problems with the socket (and you can drill down to the next level of isolation there). If other lamps work in that socket, but changing the bulb on this lamp doesn’t fix things, you’ve isolated the problem to being somewhere between the socket and the bulb. Could it be the fuse? You’re stepping down the levels of isolation.

Debugging skills are applicable in the real world as well as in software, but specifically when we are talking about computers, some rules of thumb to help you track down places where things go wrong:

1.  starting is hard (check for things going wrong on first run — initialisation problems, failed assumptions etc)
2.  finishing is hard (check for things being left in a bad state at the end of a loop — does something happen differently on last run?)
3.  counting is hard (as the well-known [joke](http://martinfowler.com/bliki/TwoHardThings.html) goes, “there are only two hard things in computer science: cache invalidation, naming things, and off-by-one errors” — look for failures to do things the right number of times, or remember how many times they have been done so far)
4.  unintended constraints will bite you (things will be bigger and slower than you expect when you are interacting with the real world — look for implicit constraints on size of variables, timeouts, etc.)
5.  when you’ve ruled out all possible reasons, it’s still **not** going to be a compiler error, hardware failure, or cosmic rays (probably). Congratulations — you’ve just found the “impossible” part

**You win when you find the “impossible” part?**

Through all of these steps, you will eventually come to the part that makes no sense (science progresses not with eureka, but with “that’s funny”). In code terms, that’s something like the code snippet where:

```
a = 1b = 1a + b == 2 // returns false
```

You’ll be tempted to start blaming the compiler, hardware failure, or cosmic rays. Stop yourself. 99.9 or even 99.99% of the time, you’re looking right where you need to be — at your own code. It’s not a conspiracy. You’ve messed up the syntax (forgotten a semi-colon, used = instead of ==, etc.) or an assumption is wrong. Keep looking right here and isolate and reproduce the problem until you have it in its simplest form.

If you still can’t spot what’s going wrong…

Have you explained the problem to someone else?
-----------------------------------------------

I mentioned [rubber duck debugging](http://www.rubberduckdebugging.com/) in passing above. This refers to the magical things that happen when you say out loud the problem, the steps you’ve been through to isolate it, and all the reasons that it’s absolutely **impossible** for the system to be working the way it is. Often, right as the word “impossible” is about to come out of your mouth, you figure it out. You spot the ridiculous assumption, and you say “never mind, I figured it out”.

In many cases, a co-conspirator who is paying attention isn’t even needed for this to work (see: rubber duck!), but it’s hard to persuade ourselves not to take short-cuts when we are explaining things to an inanimate object, and sometimes we need an actual living, breathing human being.

And _sometimes_, we actually need them to be paying attention. Sometimes, that moment of inspiration doesn’t come. If we’re lucky, our partner spots the problem at this point, but if it’s particularly gnarly, the best we should be hoping for is to get new ideas for better ways to do the steps above — reproducing, isolating, etc.

Have you slept on it?
---------------------

There’s something strange about logic problems that makes them occasionally easier to see out of the corner of your eye than they are when you are looking straight at them. If nothing is working, you may have to step away from the problem. Get a coffee. Take a walk. Work on something else for a while. Even sleep on it.

Hopefully when you get up the next day and go back to the problem it’ll be bleedingly obvious. It often is.

If not, maybe it is a hardware error or cosmic rays.

_Shout out to_ [_A Leader is a Teacher_](https://medium.com/@kiyanforoughi/a-leader-is-a-teacher-ec4171c2c47c#.s680ng7j2) _by_ [_Kiyan Foroughi_](https://medium.com/@kiyanforoughi) _— his list of specific areas to teach was one of the things that persuaded me to write this particular piece. And if you’re interested in learning more about the engineering side of things and what you need to do when you track the bug down, I enjoyed_ [_this article_](http://blog.regehr.org/archives/199)_._
