import { User } from './User';
import HelpdeskQuestion from './HelpdeskQuestion';

User.hasMany(HelpdeskQuestion, {
  foreignKey: 'userId',
  as: 'helpdeskQuestions',
});

HelpdeskQuestion.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

HelpdeskQuestion.belongsTo(User, {
  foreignKey: 'respondedBy',
  as: 'responder',
});

export { User, HelpdeskQuestion };
