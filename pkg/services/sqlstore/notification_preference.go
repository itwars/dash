package sqlstore

import (
	"time"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
	"github.com/pkg/errors"
)

func init() {
	bus.AddHandler("sql", CreateOrUpdateNotificationPreference)
	bus.AddHandler("sql", GetNotificationPreferences)
}

func CreateOrUpdateNotificationPreference(msg *models.CreateOrUpdateNotificationPreferenceMsg) error {

	return inTransaction(func(sess *DBSession) (err error) {
		notificationPreference := models.NotificationPreference{}
		exists, err := x.Where("notifier_id = ? AND user_id = ? ", msg.NotifierId, msg.UserId).Get(&notificationPreference)
		if err != nil {
			return errors.Wrapf(err, "notification preference for  notifier_id: %d get failed", msg.NotifierId)
		}
		if exists {
			notificationPreference.UpdatedAt = timeNow()
			notificationPreference.NotifierId = msg.NotifierId
			notificationPreference.UserId = msg.UserId
			notificationPreference.Enabled = msg.Enabled
			notificationPreference.Feature = msg.Feature
			if _, err := sess.ID(notificationPreference.Id).Cols("updated_at", "notifier_id", "enabled", "user_id", "feature").UseBool(`enabled`).Update(&notificationPreference); err != nil {
				return errors.Wrapf(err, "notification preference id: %d updation failed", notificationPreference.Id)
			}
		} else {
			notificationPreference = models.NotificationPreference{
				CreatedAt:  time.Now(),
				UpdatedAt:  time.Now(),
				NotifierId: msg.NotifierId,
				UserId:     msg.UserId,
				Feature:    msg.Feature,
				Enabled:    msg.Enabled,
			}
			if _, err = sess.Insert(&notificationPreference); err != nil {
				return errors.Wrapf(err, "notification preference notifier_id: %d creation failed", msg.NotifierId)
			}
		}
		return err
	})
	return nil
}

func GetNotificationPreferences(msg *models.GetNotificationPreferencesMsg) error {

	msg.Result.Data = make([]*models.NotificationPreferenceRsp, 0)
	if err := x.SQL(`SELECT
					notifier.id AS notifier_id,
					notifier.name AS name,
					notification_preference.feature AS feature,
					notification_preference.enabled AS enabled
					FROM notifier AS notifier
					INNER JOIN notification_preference ON notification_preference.notifier_id = notifier.id
					WHERE notification_preference.user_id = ?
					AND notification_preference.feature = ?
					AND notifier.id = ? `, msg.UserId, msg.Feature, msg.NotifierId).Find(&msg.Result.Data); err != nil {
		return errors.Wrapf(err, "fetch notification preferences failed")
	}
	msg.Result.PerPage = msg.PerPage
	msg.Result.Page = msg.Page
	msg.Result.TotalCount = int64(len(msg.Result.Data))
	return nil
}
