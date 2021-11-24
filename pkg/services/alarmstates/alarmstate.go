package alarmstates

import (
	"context"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/setting"
)

type AlarmState struct {
	Bus               bus.Bus
	Cfg               *setting.Cfg
	log               log.Logger
	createQueue       chan *models.CreateAlarmStateJob
	updateQueue       chan *models.UpdateUserAlarmJob
	updateAlarmsQueue chan *models.UpdateAlarmStateJob
}

func ProvideService(bus bus.Bus, cfg *setting.Cfg) (*AlarmState, error) {
	as := &AlarmState{
		Bus:               bus,
		Cfg:               cfg,
		log:               log.New("alarm_state"),
		createQueue:       make(chan *models.CreateAlarmStateJob, 10),
		updateQueue:       make(chan *models.UpdateUserAlarmJob, 10),
		updateAlarmsQueue: make(chan *models.UpdateAlarmStateJob, 10),
	}
	as.Bus.AddHandler(as.CreateAlarmState)
	as.Bus.AddHandler(as.UpdateUserAlarm)
	as.Bus.AddHandler(as.UpdateAlarmState)
	return as, nil
}

func (a *AlarmState) Run(ctx context.Context) error {

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case job := <-a.createQueue:
			{
				msg := &models.CreateAlarmStateMsg{
					AlarmId:    job.AlarmId,
					Name:       job.Name,
					AlarmLevel: job.AlarmLevel,
					Context:    job.Context,
					For:        job.For,
					Enabled:    job.Enabled,
				}
				if err := a.Bus.Dispatch(msg); err != nil {
					a.log.Error("creating alarm_state failed.", "error", err)
				}
			}
		case job := <-a.updateQueue:
			{
				msg := &models.UpdateUserAlarmMsg{
					AlarmId:    job.AlarmId,
					OrgId:      job.OrgId,
					SiteId:     job.SiteId,
					AssetId:    job.AssetId,
					AlarmLevel: job.AlarmLevel,
					Context:    job.Context,
					For:        job.For,
					Enabled:    job.Enabled,
				}
				if err := a.Bus.Dispatch(msg); err != nil {
					a.log.Error("update alarm_state failed.", "error", err)
				}
			}
		case job := <-a.updateAlarmsQueue:
			{
				msg := &models.UpdateAlarmStateMsg{
					AlarmId: job.AlarmId,
					Name:    job.Name,
					Context: job.Context,
					For:     job.For,
					Enabled: job.Enabled,
				}
				if err := a.Bus.Dispatch(msg); err != nil {
					a.log.Error("update alarm_state failed.", "error", err)
				}
			}
		}
	}
}

func (a *AlarmState) CreateAlarmState(job *models.CreateAlarmStateJob) error {
	a.createQueue <- job
	return nil
}

func (a *AlarmState) UpdateUserAlarm(job *models.UpdateUserAlarmJob) error {
	a.updateQueue <- job
	return nil
}

func (a *AlarmState) UpdateAlarmState(job *models.UpdateAlarmStateJob) error {
	a.updateAlarmsQueue <- job
	return nil
}
