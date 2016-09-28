package org.igov.service.business.action.task.listener;

import java.util.List;
import org.activiti.engine.ActivitiIllegalArgumentException;
import org.activiti.engine.RuntimeService;
import org.activiti.engine.delegate.DelegateExecution;
import org.activiti.engine.delegate.DelegateTask;
import org.activiti.engine.delegate.Expression;
import org.activiti.engine.delegate.TaskListener;
import org.activiti.engine.identity.Group;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import static org.igov.service.business.action.task.core.AbstractModelTask.getStringFromFieldExpression;
import org.springframework.beans.factory.annotation.Autowired;

/**
 *
 * @author cepera
 */
@Component("assignGroupByPrefix")
public class AssignGroupByPrefixListener implements TaskListener {
    
    private static final transient Logger LOG = LoggerFactory.getLogger(AssignGroupByPrefixListener.class);
    
    private Expression prefix;
    private Expression resultField_Group;
    
    @Autowired
    private RuntimeService runtimeService;
    
    @Override
    public void notify(DelegateTask delegateTask) {
        DelegateExecution execution = delegateTask.getExecution();
        String prefix = getStringFromFieldExpression(this.prefix, execution);
        LOG.info("prefix: " + prefix);
        String resultField_Group = getStringFromFieldExpression(this.resultField_Group, execution);
        LOG.info("resultField_Group: " + resultField_Group);
        // getting TaskOwner's user
        String sTaskOwner = delegateTask.getAssignee();        
        LOG.info("TaskOwner: " + sTaskOwner);
        // List of TaskOwner's group
        List<Group> ownerGroup = execution.getEngineServices().getIdentityService().createGroupQuery()
                .groupMember(sTaskOwner).list();
        int nCountOfGroups = 0;
        for (Group group : ownerGroup) {
            LOG.info(group.getId() + ": " + prefix);
            if (group.getId().equals(prefix)) {
                nCountOfGroups++;                
            }            
        }
        LOG.info("Count of groups like " + prefix + " is " + nCountOfGroups);
        if (nCountOfGroups == 1) {
            LOG.info("Set into " + resultField_Group + " value " + prefix);
            runtimeService.setVariable(execution.getProcessInstanceId(), resultField_Group, prefix);
        } else {
            LOG.warn("Групи " + prefix + " не існує, або їх декілька");
            throw new ActivitiIllegalArgumentException("Вказаної групи не існує, або їх декілька");
        }
        
    }
    
}
